// src/app/presentation/features/events/services/event.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  AssignmentResponse,
  MediaFile,
  GalleryMediaDto} from '../models/event.model';
import { environment } from '../../../../../environments/environment';

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
  
  private readonly API_URL = `${environment.apiUrl}/api/events`;
  private readonly MEDIA_API_URL = `${environment.apiUrl}/api/media`;

  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor() { }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('EventService Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.detail || error.error.message || errorMessage;
      } else {
        switch (error.status) {
          case 400: errorMessage = 'Invalid data provided'; break;
          case 401: errorMessage = 'Your session has expired. Please login again.'; break;
          case 403: errorMessage = 'You do not have permission to perform this action'; break;
          case 404: errorMessage = 'Event not found'; break;
          case 409: errorMessage = 'Event conflict occurred'; break;
          case 422: errorMessage = 'Validation failed'; break;
          case 500: errorMessage = 'Server error. Please try again later.'; break;
          default: errorMessage = `Server Error: ${error.status} - ${error.message}`;
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
  private transformToApiRequest(formData: EventFormData): CreateEventRequest {
    const eventPlace = formData.eventType === EventType.PHYSICAL 
      ? formData.address 
      : formData.meetingLink;

    return {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      category: this.getCategoryName(formData.eventCategoryId),
      startDate: this.formatDateToISO(formData.startDateTime),
      endDate: this.formatDateToISO(formData.endDateTime),
      eventPlace: eventPlace?.trim() || '',
      coverImageUrl: formData.coverImageUrl?.trim() || undefined,
      departmentId: formData.departmentId?.toString()
    };
  }

  private getCategoryName(categoryId: number): string {
    const categories: Record<number, string> = {
      1: 'Project Launch', 2: 'Workshop / Training', 3: 'Media Visit', 4: 'Inspection',
      5: 'Board Meeting', 6: 'Team Building', 7: 'Conference', 8: 'Networking Event'
    };
    return categories[categoryId] || '';
  }

  /**
   * Format date to ISO string
   */
  private formatDateToISO(date: Date | string): string {
    if (!date) return '';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
      return dateObj.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  createEvent(formData: EventFormData, _status: EventStatus): Observable<Event> {
    const requestData = this.transformToApiRequest(formData);
    return this.http.post<Event>(this.API_URL, requestData).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getAllEvents(filters?: { 
    departmentId?: string; status?: string; searchTerm?: string;
    category?: string; startDate?: string; endDate?: string;
  }): Observable<Event[]> {
    let url = this.API_URL;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    return this.http.get<Event[]>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getDiscoveryEvents(filters?: { 
    searchTerm?: string; category?: string; departmentId?: string;
    departmentName?: string[]; startDate?: string; endDate?: string; status?: string;
  }): Observable<Event[]> {
    let url = `${this.API_URL}/discovery`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else if (value) {
          params.set(key, value as string);
        }
      });
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    return this.http.get<Event[]>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getGalleryMedia(categoryId?: string | null, subCategoryId?: string | null): Observable<GalleryMediaDto[]> {
    let url = `${this.MEDIA_API_URL}/gallery`;
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (subCategoryId) params.set('subCategoryId', subCategoryId);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    return this.http.get<GalleryMediaDto[]>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getUpcomingEvents(): Observable<Event[]> {
    const url = `${this.API_URL}/upcoming`;
    return this.http.get<Event[]>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  getEventById(id: string): Observable<Event> {
    const url = `${this.API_URL}/${id}`;
    return this.http.get<Event>(url).pipe(
      tap(event => console.log('Event fetched successfully:', event)),
      catchError(this.handleError.bind(this))
    );
  }

  updateEvent(eventId: string, formData: Partial<EventFormData>, status: EventStatus): Observable<Event> {
    const requestData: any = { id: eventId, status: status };
    if (formData.title) requestData.title = formData.title.trim();
    if (formData.description !== undefined) requestData.description = formData.description?.trim() || '';
    if (formData.eventCategoryId) requestData.category = this.getCategoryName(formData.eventCategoryId);
    if (formData.startDateTime) requestData.startDate = this.formatDateToISO(formData.startDateTime);
    if (formData.endDateTime) requestData.endDate = this.formatDateToISO(formData.endDateTime);
    if (formData.eventType && (formData.address || formData.meetingLink)) {
      requestData.eventPlace = formData.eventType === EventType.PHYSICAL ? formData.address : formData.meetingLink;
    }
    if (formData.departmentId) requestData.departmentId = formData.departmentId.toString();
    if (formData.coverImageUrl) requestData.coverImageUrl = formData.coverImageUrl.trim();
    return this.http.put<Event>(`${this.API_URL}/${eventId}`, requestData).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  uploadEventCoverImage(eventId: string, file: File): Observable<string> {
    const url = `${this.API_URL}/${eventId}/cover-image`;
    const formData = new FormData();
    formData.append('File', file, file.name);
    return this.http.post<{url: string}>(url, formData).pipe(
      timeout(this.REQUEST_TIMEOUT),
      map(response => response.url),
      catchError(this.handleError.bind(this))
    );
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${eventId}`).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  approveEvent(eventId: string): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/approve`, {}).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  rejectEvent(eventId: string, reason: string): Observable<Event> {
    return this.http.patch<Event>(`${this.API_URL}/${eventId}/reject`, { reason }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }
 
  assignEmployeeToEvent(eventId: string, assignment: AssignmentPayload): Observable<any> {
    const payload = { eventId, employeeId: assignment.employeeId, role: assignment.role };
    return this.http.post<any>(`${this.API_URL}/${eventId}/assignments`, payload).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(error => {
        console.error('❌ Failed with payload:', payload, error.error);
        return throwError(() => error);
      })
    );
  }

  assignMultipleEmployees(eventId: string, assignments: AssignmentPayload[]): Observable<any[]> {
    if (assignments.length === 0) return throwError(() => new Error('No assignments provided'));
    const requests = assignments.map(assignment => {
      const payload = { eventId, employeeId: assignment.employeeId, role: assignment.role };
      return this.http.post<any>(`${this.API_URL}/${eventId}/assignments`, payload).pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(error => {
          console.error(`❌ Failed assignment:`, assignment, error);
          return throwError(() => ({ assignment, error }));
        })
      );
    });
    return forkJoin(requests).pipe(catchError(error => throwError(() => error)));
  }

  removeAssignment(eventId: string, role: string, assignmentId: string): Observable<Event> {
    return this.http.delete<Event>(`${this.API_URL}/${eventId}/assignments/${role}/${assignmentId}`).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getEventAssignments(eventId: string): Observable<EventAssignments> {
    return this.http.get<EventAssignments>(`${this.API_URL}/${eventId}/assignments`).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  updateAssignment(eventId: string, assignmentId: string, updatedData: Partial<AssignmentPayload>): Observable<Event> {
    return this.http.put<Event>(`${this.API_URL}/${eventId}/assignments/${assignmentId}`, updatedData).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  finalizeEvent(eventId: string, closureComment: string, allowOverride: boolean = false): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/finalize`, { eventId, closureComment, allowOverride }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  submitCoverage(eventId: string, assignmentId: string): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.API_URL}/${eventId}/assignments/${assignmentId}/submit-coverage`, {}).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  verifyCoverage(eventId: string, assignmentId: string, isApproved: boolean, note?: string): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.API_URL}/${eventId}/assignments/${assignmentId}/verify-coverage`, { isApproved, note }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  cancelEvent(eventId: string, comment: string): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/cancel`, { comment }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  requestCancellation(eventId: string, comment: string): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/cancellation-request`, { comment }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  approveCancellationRequest(eventId: string, comment: string = ''): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/cancellation-request/approve`, { comment }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  rejectCancellationRequest(eventId: string, comment: string = ''): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/cancellation-request/reject`, { comment }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  requestDateChange(eventId: string, payload: {
    proposedStartDate: string; proposedEndDate: string;
    proposedEventPlace?: string; reason: string;
  }): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/date-change-request`, { eventId, ...payload }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  reviewDateChange(eventId: string, approved: boolean, comment?: string): Observable<Event> {
    return this.http.post<Event>(`${this.API_URL}/${eventId}/date-change-request/review`, { eventId, approved, reviewComment: comment }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  uploadMedia(eventId: string, fileType: string, file?: File, externalUrl?: string, mediaSubCategoryId?: string): Observable<any> {
    const url = `${environment.apiUrl}/api/media/upload`;
    const formData = new FormData();
    formData.append('EventId', eventId);
    formData.append('FileType', fileType);
    if (file) formData.append('File', file);
    if (externalUrl) formData.append('ExternalUrl', externalUrl);
    if (mediaSubCategoryId) formData.append('MediaSubCategoryId', mediaSubCategoryId);
    return this.http.post<any>(url, formData).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getEventMedia(eventId: string): Observable<MediaFile[]> {
    const url = `${environment.apiUrl}/api/media/event/${eventId}`;
    return this.http.get<MediaFile[]>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  deleteMedia(mediaId: string): Observable<void> {
    const url = `${environment.apiUrl}/api/media/${mediaId}`;
    return this.http.delete<void>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getMyAssignments(): Observable<AssignmentResponse[]> {
    const url = `${environment.apiUrl}/api/my-assignments`;
    return this.http.get<AssignmentResponse[]>(url).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  updateAssignmentStatus(eventId: string, assignmentId: string, status: string, declineReason?: string): Observable<any> {
    const url = `${this.API_URL}/${eventId}/assignments/${assignmentId}/status`;
    return this.http.put<any>(url, { id: assignmentId, status, declineReason }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }
}
