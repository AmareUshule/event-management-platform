// src/app/presentation/features/events/services/event.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, retry, timeout, map, tap } from 'rxjs/operators';
import { 
  Event, 
  CreateEventRequest, 
  EventFormData, 
  EventStatus, 
  EventType, 
  AssignmentPayload,
  EventAssignments,
  AssignmentApiRequest,
  AssignmentResponse} from '../models/event.model';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthUser } from '../../../../core/models/auth-user.model';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private readonly API_URL = `${environment.apiUrl}/api/events`;

  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor() { }

  /**
   * Get HTTP headers with authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('EventService Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      // Try to get detail from backend error object first
      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.detail || error.error.message || errorMessage;
      }
      
      // If we still have generic message, use status-based defaults
      if (errorMessage === 'An unexpected error occurred' || errorMessage === 'Invalid data provided') {
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid data provided';
            break;
          case 401:
            errorMessage = 'Your session has expired. Please login again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action';
            break;
          case 404:
            errorMessage = 'Event not found';
            break;
          case 409:
            errorMessage = 'Event conflict occurred';
            break;
          case 422:
            errorMessage = 'Validation failed';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server Error: ${error.status} - ${error.message}`;
        }
      }
    }
    
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      errors: error.error?.errors || error.error
    }));
  }

  /**
   * Transform form data to API request format
   */
  private transformToApiRequest(formData: EventFormData, status: EventStatus, user: AuthUser): CreateEventRequest {
    // Determine the event place based on event type
    const eventPlace = formData.eventType === EventType.PHYSICAL 
      ? formData.address 
      : formData.meetingLink;

    return {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      startDate: this.formatDateToISO(formData.startDateTime),
      endDate: this.formatDateToISO(formData.endDateTime),
      eventPlace: eventPlace?.trim() || '',
      status: status,
      department: {
        id: formData.departmentId.toString() // Convert number to string - API expects string
      },
      createdBy: {
        id: user.adObjectId,        // This is the GUID/string ID from backend
        employeeId: user.employeeId.toString() // Convert number to string - API expects string
      }
    };
  }

  /**
   * Format date to ISO string
   */
  private formatDateToISO(date: Date | string): string {
    if (!date) return '';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }
      return dateObj.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  /**
   * Create a new event
   */
  createEvent(formData: EventFormData, status: EventStatus): Observable<Event> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const requestData = this.transformToApiRequest(
      formData, 
      status, 
      currentUser  // Pass the entire user object
    );

    console.log('📦 Sending to API:', JSON.stringify(requestData, null, 2));

    return this.http.post<Event>(
      this.API_URL, 
      requestData, 
      { 
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get all events with optional filters
   */
  getAllEvents(filters?: { departmentId?: string; status?: string }): Observable<Event[]> {
    let url = this.API_URL;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.departmentId) params.set('departmentId', filters.departmentId);
      if (filters.status) params.set('status', filters.status);
      url += `?${params.toString()}`;
    }
    
    return this.http.get<Event[]>(url, { 
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get upcoming events
   */
  getUpcomingEvents(): Observable<Event[]> {
    const url = `${this.API_URL}/upcoming`;
    
    return this.http.get<Event[]>(url, { 
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get event by ID
   */
  getEventById(id: string): Observable<Event> {
    const url = `${this.API_URL}/${id}`;
    console.log('Fetching event from:', url);
    
    return this.http.get<Event>(url, {
      headers: this.getHeaders()
    }).pipe(
      tap(event => console.log('Event fetched successfully:', event)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Update event
   */
  updateEvent(eventId: string, formData: Partial<EventFormData>, status: EventStatus): Observable<Event> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const requestData: any = {};
    
    if (formData.title) requestData.title = formData.title.trim();
    if (formData.description !== undefined) requestData.description = formData.description?.trim() || '';
    if (formData.startDateTime) requestData.startDate = this.formatDateToISO(formData.startDateTime);
    if (formData.endDateTime) requestData.endDate = this.formatDateToISO(formData.endDateTime);
    if (formData.eventType && (formData.address || formData.meetingLink)) {
      requestData.eventPlace = formData.eventType === EventType.PHYSICAL 
        ? formData.address 
        : formData.meetingLink;
    }
    if (formData.departmentId) {
      requestData.department = { id: formData.departmentId.toString() };
    }
    requestData.status = status;

    return this.http.put<Event>(
      `${this.API_URL}/${eventId}`, 
      requestData, 
      { 
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Delete event
   */
  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${eventId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Approve event
   */
  approveEvent(eventId: string): Observable<Event> {
    return this.http.post<Event>(
      `${this.API_URL}/${eventId}/approve`, 
      {}, 
      { 
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Reject event
   */
  rejectEvent(eventId: string, reason: string): Observable<Event> {
    return this.http.patch<Event>(
      `${this.API_URL}/${eventId}/reject`, 
      { reason }, 
      { 
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }
 

  /**
   * Assign a single employee to an event
   * API expects a single assignment object, not an array
   */
   
assignEmployeeToEvent(eventId: string, assignment: AssignmentPayload): Observable<Event> {
  console.log('📦 Sending single assignment:', { eventId, ...assignment });
  
  // Try both ID formats to see which one works
  const payload = {
    eventId: eventId,
    employeeId: assignment.employeeId, // This might need to be the string ID
    role: assignment.role
  };
  
  console.log('Full payload being sent:', JSON.stringify(payload, null, 2));
  
  return this.http.post<Event>(
    `${this.API_URL}/${eventId}/assignments`, 
    payload,
    { 
      headers: this.getHeaders(),
      responseType: 'json'
    }
  ).pipe(
    timeout(this.REQUEST_TIMEOUT),
    tap(result => console.log('✅ Assignment successful:', result)),
    catchError(error => {
      console.error('❌ Failed with payload:', payload);
      console.error('Error details:', error.error);
      return throwError(() => error);
    })
  );
}

// Update assignMultipleEmployees:
assignMultipleEmployees(eventId: string, assignments: AssignmentPayload[]): Observable<Event[]> {
  console.log(`📦 Sending ${assignments.length} assignments one by one`);
  console.log('Original assignments:', assignments);
  
  if (assignments.length === 0) {
    return throwError(() => new Error('No assignments provided'));
  }
  
  // Send them sequentially instead of in parallel to better identify which one fails
  const requests = assignments.map((assignment, index) => {
    const payload = {
      eventId: eventId,
      employeeId: assignment.employeeId,
      role: assignment.role
    };
    
    console.log(`Request ${index + 1}:`, payload);
    
    return this.http.post<Event>(
      `${this.API_URL}/${eventId}/assignments`,
      payload,
      { 
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(error => {
        console.error(`❌ Failed assignment ${index + 1}:`, assignment, error);
        // Return the error but don't stop other requests
        return throwError(() => ({
          assignment,
          error,
          index
        }));
      })
    );
  });
  
  // Use forkJoin to execute all requests
  return forkJoin(requests).pipe(
    tap(results => console.log(`✅ All assignments processed:`, results)),
    catchError(error => {
      console.error('❌ Some assignments failed:', error);
      return throwError(() => error);
    })
  );
}


  /**
   * Remove an assignment
   */
  removeAssignment(eventId: string, role: string, assignmentId: string): Observable<Event> {
    return this.http.delete<Event>(
      `${this.API_URL}/${eventId}/assignments/${role}/${assignmentId}`,
      { 
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(result => console.log('✅ Assignment removed:', result)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get all assignments for an event
   */
  getEventAssignments(eventId: string): Observable<EventAssignments> {
    const url = `${this.API_URL}/${eventId}/assignments`;
    
    return this.http.get<EventAssignments>(
      url,
      {
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(assignments => console.log('📋 Event assignments:', assignments)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Update an existing assignment
   */
  updateAssignment(eventId: string, assignmentId: string, updatedData: Partial<AssignmentPayload>): Observable<Event> {
    const url = `${this.API_URL}/${eventId}/assignments/${assignmentId}`;
    
    return this.http.put<Event>(
      url,
      updatedData,
      {
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(updatedEvent => console.log('✅ Assignment updated successfully:', updatedEvent)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Submit event for approval
   */
  submitEvent(eventId: string): Observable<Event> {
    return this.http.post<Event>(
      `${this.API_URL}/${eventId}/submit`,
      {},
      {
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Archive event
   */
  archiveEvent(eventId: string): Observable<Event> {
    return this.http.post<Event>(
      `${this.API_URL}/${eventId}/archive`,
      {},
      {
        headers: this.getHeaders(),
        responseType: 'json'
      }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Upload media for an event
   */
  uploadMedia(eventId: string, fileType: string, file?: File, externalUrl?: string): Observable<any> {
    const url = `${environment.apiUrl}/api/media/upload`;
    const formData = new FormData();
    formData.append('EventId', eventId);
    formData.append('FileType', fileType);
    if (file) {
      formData.append('File', file);
    }
    if (externalUrl) {
      formData.append('ExternalUrl', externalUrl);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<any>(url, formData, { headers }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get media for an event
   */
  getEventMedia(eventId: string): Observable<any[]> {
    const url = `${environment.apiUrl}/api/media/event/${eventId}`;
    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get assignments for the current user
   */
  getMyAssignments(): Observable<AssignmentResponse[]> {
    const url = `${environment.apiUrl}/api/my-assignments`;
    return this.http.get<AssignmentResponse[]>(url, { headers: this.getHeaders() }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Update assignment status (Accept/Decline)
   */
  updateAssignmentStatus(eventId: string, assignmentId: string, status: string, declineReason?: string): Observable<any> {
    const url = `${this.API_URL}/${eventId}/assignments/${assignmentId}/status`;
    return this.http.put<any>(
      url,
      { id: assignmentId, status, declineReason },
      { headers: this.getHeaders() }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }
}