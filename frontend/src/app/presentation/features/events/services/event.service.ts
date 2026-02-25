// src/app/presentation/features/events/services/event.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { Event, CreateEventRequest, EventFormData, EventStatus, EventType } from '../models/event.model';
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
      'Accept': 'text/plain', // backend expects text/plain
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('EventService Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
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
    
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      errors: error.error?.errors
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
        id: formData.departmentId.toString() // Convert number to string  API expects string
      },
      createdBy: {
        id: user.adObjectId,        // This is the GUID/string ID from backend
        employeeId: user.employeeId.toString() // Convert number to string  API expects string
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
   * Get event by ID
   */
  getEventById(eventId: string): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/${eventId}`, { 
      headers: this.getHeaders(),
      responseType: 'json'
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
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
    return this.http.patch<Event>(
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
}