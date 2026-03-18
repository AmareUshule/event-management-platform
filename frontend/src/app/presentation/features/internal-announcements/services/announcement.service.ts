import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto, AnnouncementMedia, JobVacancy, CreateJobVacancyDto } from '../models/announcement.model';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/auth/auth.service';

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private readonly API_URL = `${environment.apiUrl}/api/Announcements`;
  private readonly REQUEST_TIMEOUT = 30000;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getMultipartHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('AnnouncementService Error:', error);
    let errorMessage = error.error?.message || 'An unexpected error occurred';
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error
    }));
  }

  getPublishedAnnouncements(page: number = 1, pageSize: number = 10): Observable<PagedResponse<Announcement>> {
    return this.http.get<PagedResponse<Announcement>>(`${this.API_URL}/published?page=${page}&pageSize=${pageSize}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getDraftAnnouncements(page: number = 1, pageSize: number = 10): Observable<PagedResponse<Announcement>> {
    return this.http.get<PagedResponse<Announcement>>(`${this.API_URL}/drafts?page=${page}&pageSize=${pageSize}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getPendingAnnouncements(page: number = 1, pageSize: number = 10): Observable<PagedResponse<Announcement>> {
    return this.http.get<PagedResponse<Announcement>>(`${this.API_URL}/pending?page=${page}&pageSize=${pageSize}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getRejectedAnnouncements(page: number = 1, pageSize: number = 10): Observable<PagedResponse<Announcement>> {
    return this.http.get<PagedResponse<Announcement>>(`${this.API_URL}/rejected?page=${page}&pageSize=${pageSize}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getAnnouncementById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.API_URL}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  createAnnouncement(data: CreateAnnouncementDto): Observable<Announcement> {
    return this.http.post<Announcement>(this.API_URL, data, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  updateAnnouncement(id: string, data: UpdateAnnouncementDto): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.API_URL}/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  deleteAnnouncement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  publishAnnouncement(id: string): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.API_URL}/${id}/publish`, {}, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  submitForApproval(id: string): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.API_URL}/${id}/submit`, {}, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  rejectAnnouncement(id: string): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.API_URL}/${id}/reject`, {}, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  uploadMedia(id: string, file: File): Observable<AnnouncementMedia> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<AnnouncementMedia>(`${this.API_URL}/${id}/media`, formData, {
      headers: this.getMultipartHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  createJobVacancy(announcementId: string, data: CreateJobVacancyDto): Observable<JobVacancy> {
    return this.http.post<JobVacancy>(`${this.API_URL}/${announcementId}/jobs`, data, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }

  getJobVacancies(announcementId: string): Observable<JobVacancy[]> {
    return this.http.get<JobVacancy[]>(`${this.API_URL}/${announcementId}/jobs`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError.bind(this))
    );
  }
}
