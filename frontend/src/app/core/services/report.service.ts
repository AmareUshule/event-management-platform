import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, retry, timeout, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface ReportSummary {
  totalEvents: number;
  draftCount: number;
  scheduledCount: number;
  ongoingCount: number;
  completedCount: number;
  archivedCount: number;
  cancelledCount: number;
  pendingApprovalsCount: number;
  assignedEventsCount: number;
  pendingAssignmentsCount: number;
}

export interface StaffEventSummary {
  eventId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  roleInEvent: string;
}

export interface StaffWorkload {
  staffId: string;
  fullName: string;
  role: string;
  departmentName: string;
  totalAssignments: number;
  scheduledAssignments: number;
  pastAssignments: number;
  events: StaffEventSummary[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private readonly API_URL = `${environment.apiUrl}/api/reports`;
  private readonly REQUEST_TIMEOUT = 30000;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getReportSummary(): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${this.API_URL}/summary`, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(1),
      catchError(this.handleError)
    );
  }

  getStaffWorkload(params?: { startDate?: string; endDate?: string; role?: string; staffId?: string }): Observable<StaffWorkload[]> {
    let url = `${this.API_URL}/staff-workload`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);
      if (params.role) queryParams.set('role', params.role);
      if (params.staffId) queryParams.set('staffId', params.staffId);
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }

    return this.http.get<StaffWorkload[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  exportReportSummary(): void {
    const token = this.authService.getToken();
    const url = `${this.API_URL}/summary/export`;
    
    // We can use window.open if the backend allows token in query or if we handle it differently
    // But since we need the Bearer token, we should fetch it as a blob
    this.http.get(url, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `EventSummary_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        console.error('Failed to export report:', error);
      }
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('ReportService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
