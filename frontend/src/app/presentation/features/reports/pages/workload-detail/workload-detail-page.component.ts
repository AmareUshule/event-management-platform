import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ReportService, StaffWorkload, StaffEventSummary } from '../../../../../core/services/report.service';
import { EventService } from '../../../events/services/event.service';
import { AssignmentRole } from '../../../events/models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-workload-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './workload-detail-page.component.html',
  styleUrls: ['./workload-detail-page.component.scss']
})
export class WorkloadDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  staffWorkload: StaffWorkload | null = null;

  // Filters
  presetDays = 30;
  startDate: Date | null = null;
  endDate: Date | null = null;
  // Event list controls
  sortOrder: 'asc' | 'desc' = 'desc';
  statusFilter: string = '';
  coverageFilter: string = ''; // '', 'Covered', 'Uncovered'

  constructor() {}

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  ngOnInit(): void {
    const staffId = this.route.snapshot.paramMap.get('staffId');
    if (!staffId) {
      this.snackBar.open('Staff not specified', 'Close', { duration: 3000 });
      return;
    }

    this.loadWorkload(staffId);
  }

  exportData(): void {
    this.reportService.exportReportSummary();
    this.snackBar.open('Exporting workload report...', 'Close', { duration: 2000 });
  }

  loadWorkload(staffId: string): void {
    this.isLoading = true;

    const params: any = { staffId };
    if (this.startDate) params.startDate = this.startDate.toISOString();
    if (this.endDate) params.endDate = this.endDate.toISOString();

    this.reportService.getStaffWorkload(params).subscribe({
      next: (data) => {
        this.staffWorkload = data && data.length > 0 ? data[0] : null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open('Failed to load staff workload', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyPreset(days: number): void {
    this.presetDays = days;
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.endDate.getDate() - days);

    const staffId = this.route.snapshot.paramMap.get('staffId')!;
    this.loadWorkload(staffId);
  }

  applyCustom(): void {
    const staffId = this.route.snapshot.paramMap.get('staffId')!;
    this.loadWorkload(staffId);
  }

  getFilteredSortedEvents(): StaffEventSummary[] {
    if (!this.staffWorkload) return [];

    let events = [...this.staffWorkload.events];

    if (this.statusFilter) {
      events = events.filter(e => e.status === this.statusFilter);
    }

    if (this.coverageFilter) {
      events = events.filter(e => e.status === this.coverageFilter);
    }

    events.sort((a, b) => {
      const da = new Date(a.startDate).getTime();
      const db = new Date(b.startDate).getTime();
      return this.sortOrder === 'asc' ? da - db : db - da;
    });

    return events;
  }

  isPast(event: StaffEventSummary): boolean {
    try {
      const now = new Date().getTime();
      return new Date(event.endDate).getTime() < now;
    } catch {
      return false;
    }
  }

  getUpcomingEvents(): StaffEventSummary[] {
    if (!this.staffWorkload?.events?.length) return [];
    const now = new Date().getTime();
    return this.staffWorkload.events
      .filter((event) => new Date(event.endDate).getTime() >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  getNextEvent(): StaffEventSummary | null {
    return this.getUpcomingEvents()[0] || null;
  }

  getStatusOptions(): string[] {
    if (!this.staffWorkload?.events?.length) return [];
    return Array.from(new Set(this.staffWorkload.events.map((event) => event.status))).sort();
  }

  getRoleBreakdown(): { role: string; count: number }[] {
    if (!this.staffWorkload?.events?.length) return [];
    const counts = this.staffWorkload.events.reduce((acc, event) => {
      acc[event.roleInEvent] = (acc[event.roleInEvent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([role, count]) => ({ role, count }));
  }

  getActivePercentage(): number {
    if (!this.staffWorkload?.totalAssignments) return 0;
    return Math.round((this.staffWorkload.scheduledAssignments / this.staffWorkload.totalAssignments) * 100);
  }

  getPastPercentage(): number {
    if (!this.staffWorkload?.totalAssignments) return 0;
    return Math.round((this.staffWorkload.pastAssignments / this.staffWorkload.totalAssignments) * 100);
  }

  getLoadLabel(): string {
    const active = this.staffWorkload?.scheduledAssignments || 0;
    if (active >= 4) return 'Overloaded';
    if (active >= 3) return 'Busy';
    if (active >= 2) return 'Steady';
    return 'Available';
  }

  getPeriodLabel(): string {
    if (this.startDate && this.endDate) {
      return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
    }

    if (this.startDate) return `From ${this.startDate.toLocaleDateString()}`;
    if (this.endDate) return `Until ${this.endDate.toLocaleDateString()}`;
    return 'All dates';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
      case 'Ongoing':
      case 'Completed':
      case 'Covered':
        return 'status-published';
      case 'Draft':
        return 'status-draft';
      case 'Concluded':
        return 'status-concluded';
      case 'Cancelled':
      case 'Rejected':
      case 'Uncovered':
        return 'status-rejected';
      default:
        return status.toLowerCase();
    }
  }

  // Actions
  removeAssignment(event: StaffEventSummary): void {
    if (!confirm('Remove this assignment?')) return;

    const eventId = event.eventId;
    const assignmentId = event.assignmentId;
    const role = event.roleInEvent;
    if (!assignmentId) {
      this.snackBar.open('Cannot remove assignment: missing id', 'Close', { duration: 3000 });
      return;
    }

    this.eventService.removeAssignment(eventId, role, assignmentId).subscribe({
      next: () => {
        this.snackBar.open('Assignment removed', 'Close', { duration: 2000 });
        const staffId = this.route.snapshot.paramMap.get('staffId')!;
        this.loadWorkload(staffId);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to remove assignment', 'Close', { duration: 3000 });
      }
    });
  }

  markCovered(event: StaffEventSummary): void {
    if (!confirm('Mark coverage as approved for this assignment?')) return;
    if (!event.assignmentId) {
      this.snackBar.open('Cannot verify coverage: missing assignment id', 'Close', { duration: 3000 });
      return;
    }

    this.eventService.verifyCoverage(event.eventId, event.assignmentId, true).subscribe({
      next: () => {
        this.snackBar.open('Coverage approved', 'Close', { duration: 2000 });
        const staffId = this.route.snapshot.paramMap.get('staffId')!;
        this.loadWorkload(staffId);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to approve coverage', 'Close', { duration: 3000 });
      }
    });
  }

  assignToEvent(event: StaffEventSummary): void {
    if (!this.staffWorkload) return;
    if (!confirm('Assign this staff to the event?')) return;

    const payload = { employeeId: this.staffWorkload.staffId, role: event.roleInEvent as AssignmentRole };
    this.eventService.assignEmployeeToEvent(event.eventId, payload).subscribe({
      next: () => {
        this.snackBar.open('Staff assigned to event', 'Close', { duration: 2000 });
        const staffId = this.route.snapshot.paramMap.get('staffId')!;
        this.loadWorkload(staffId);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to assign staff', 'Close', { duration: 3000 });
      }
    });
  }
}
