// src/app/presentation/features/events/services/event.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { Event } from '../models/event.model';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/auth/auth.service';

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
   * Create a new event
   */
  createEvent(eventData: Event): Observable<ApiResponse<Event>> {
    return this.http.post<ApiResponse<Event>>(
      this.API_URL, 
      eventData, 
      { headers: this.getHeaders() }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get all events with optional filters
   */
  getAllEvents(filters?: { departmentId?: number; status?: string }): Observable<ApiResponse<Event[]>> {
    let url = this.API_URL;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.departmentId) params.set('departmentId', filters.departmentId.toString());
      if (filters.status) params.set('status', filters.status);
      url += `?${params.toString()}`;
    }
    
    return this.http.get<ApiResponse<Event[]>>(url, { headers: this.getHeaders() })
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get event by ID
   */
  getEventById(eventId: string): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(`${this.API_URL}/${eventId}`, { headers: this.getHeaders() })
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Update event
   */
  updateEvent(eventId: string, eventData: Partial<Event>): Observable<ApiResponse<Event>> {
    return this.http.put<ApiResponse<Event>>(
      `${this.API_URL}/${eventId}`, 
      eventData, 
      { headers: this.getHeaders() }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Delete event
   */
  deleteEvent(eventId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${eventId}`, { headers: this.getHeaders() })
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        retry(1),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Approve event
   */
  approveEvent(eventId: string): Observable<ApiResponse<Event>> {
    return this.http.patch<ApiResponse<Event>>(
      `${this.API_URL}/${eventId}/approve`, 
      {}, 
      { headers: this.getHeaders() }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Reject event
   */
  rejectEvent(eventId: string, reason: string): Observable<ApiResponse<Event>> {
    return this.http.patch<ApiResponse<Event>>(
      `${this.API_URL}/${eventId}/reject`, 
      { reason }, 
      { headers: this.getHeaders() }
    ).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }
}