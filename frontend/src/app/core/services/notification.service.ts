import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private readonly API_URL = `${environment.apiUrl}/api/notifications`;
  private readonly REQUEST_TIMEOUT = 15000;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.API_URL, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError)
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/read`, {}, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/read-all`, {}, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('NotificationService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
