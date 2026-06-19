import { Component, Input, Output, EventEmitter, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { StaffWorkload, StaffEventSummary } from '../../../../../core/services/report.service';
import { EventService } from '../../../events/services/event.service';
import { AssignmentRole, Event } from '../../../events/models/event.model';

interface QuickAssignDialogData {
  staff: StaffWorkload;
}

interface QuickAssignDialogResult {
  eventId: string;
  role: AssignmentRole;
}

@Component({
  selector: 'app-quick-assign-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule],
  template: `
    <div class="quick-assign-dialog">
      <header>
        <div>
          <span>Quick assign</span>
          <h2>{{ data.staff.fullName }}</h2>
        </div>
        <button mat-icon-button aria-label="Close" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <section class="role-row">
        <label>
          Assignment role
          <mat-select [(ngModel)]="selectedRole">
            <mat-option value="Expert">Expert</mat-option>
            <mat-option value="Cameraman">Cameraman</mat-option>
          </mat-select>
        </label>
      </section>

      <div class="loading" *ngIf="isLoading">
        <mat-progress-spinner mode="indeterminate" diameter="32"></mat-progress-spinner>
        Loading upcoming events...
      </div>

      <section class="event-list" *ngIf="!isLoading && upcomingEvents.length">
        <button
          *ngFor="let event of upcomingEvents"
          class="event-option"
          [class.selected]="selectedEventId === event.id"
          (click)="selectedEventId = event.id || ''">
          <span class="event-title">{{ event.title }}</span>
          <span class="event-meta">
            <mat-icon>schedule</mat-icon>
            {{ event.startDate | date:'MMM d, y h:mm a' }}
          </span>
          <span class="event-meta" *ngIf="event.eventPlace">
            <mat-icon>location_on</mat-icon>
            {{ event.eventPlace }}
          </span>
          <span class="event-status">{{ event.status }}</span>
        </button>
      </section>

      <section class="empty" *ngIf="!isLoading && !upcomingEvents.length">
        <mat-icon>event_busy</mat-icon>
        No upcoming events available.
      </section>

      <footer>
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-flat-button class="assign-button" [disabled]="!selectedEventId" (click)="assign()">
          Assign staff
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .quick-assign-dialog { width: min(620px, 92vw); color: #0f172a; }
    header, footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    header { padding-bottom: 14px; border-bottom: 1px solid #e2e8f0; }
    header span { color: #1E590C; font-size: 11px; font-weight: 900; text-transform: uppercase; }
    h2 { margin: 4px 0 0; font-size: 24px; font-weight: 900; }
    .role-row { padding: 14px 0; }
    label { display: grid; gap: 8px; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; }
    mat-select { padding: 11px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #0f172a; }
    .loading, .empty { min-height: 160px; display: grid; place-items: center; gap: 10px; color: #64748b; font-weight: 800; }
    .empty mat-icon { width: 42px; height: 42px; font-size: 42px; color: #94a3b8; }
    .event-list { display: grid; gap: 10px; max-height: 420px; overflow: auto; padding-right: 4px; }
    .event-option { display: grid; gap: 6px; width: 100%; padding: 13px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; text-align: left; cursor: pointer; }
    .event-option:hover, .event-option.selected { border-color: #1E590C; box-shadow: 0 0 0 3px rgba(30, 89, 12, 0.12); }
    .event-title { color: #0f172a; font-size: 15px; font-weight: 900; }
    .event-meta { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 12px; font-weight: 800; }
    .event-meta mat-icon { width: 15px; height: 15px; font-size: 15px; }
    .event-status { width: fit-content; padding: 4px 8px; border-radius: 8px; color: #1E590C; background: #ecfdf5; font-size: 11px; font-weight: 900; }
    footer { margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
    .assign-button { background: #1E590C !important; color: #fff !important; }
  `]
})
export class QuickAssignDialogComponent implements OnInit {
  isLoading = true;
  upcomingEvents: Event[] = [];
  selectedEventId = '';
  selectedRole: AssignmentRole;

  private eventService = inject(EventService);
  private snackBar = inject(MatSnackBar);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: QuickAssignDialogData,
    private dialogRef: MatDialogRef<QuickAssignDialogComponent, QuickAssignDialogResult>
  ) {
    this.selectedRole = data.staff.role as AssignmentRole;
  }

  ngOnInit(): void {
    this.eventService.getUpcomingEvents().subscribe({
      next: (events) => {
        const now = new Date().getTime();
        this.upcomingEvents = events
          .filter((event) => !!event.id && new Date(event.endDate).getTime() >= now)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load upcoming events', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  assign(): void {
    if (!this.selectedEventId) return;
    this.dialogRef.close({ eventId: this.selectedEventId, role: this.selectedRole });
  }
}

@Component({
  selector: 'app-workload-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './workload-card.component.html',
  styleUrls: ['./workload-card.component.scss']
})
export class WorkloadCardComponent {
  @Input() staff!: StaffWorkload;
  @Output() viewDetail = new EventEmitter<string>();
  @Output() refreshed = new EventEmitter<void>();

  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private eventService = inject(EventService);
  private dialog = inject(MatDialog);

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  openDetail(): void {
    if (!this.staff) return;
    this.viewDetail.emit(this.staff.staffId);
    // Navigate to the staff workload detail route handled by the main app routes
    this.router.navigate(['/staff-workload', this.staff.staffId]);
  }

  quickAssign(): void {
    if (!this.staff) return;

    this.dialog.open(QuickAssignDialogComponent, {
      data: { staff: this.staff },
      autoFocus: false,
      panelClass: 'quick-assign-panel'
    }).afterClosed().subscribe((result?: QuickAssignDialogResult) => {
      if (!result) return;

      const payload = { employeeId: this.staff.staffId, role: result.role };
      this.eventService.assignEmployeeToEvent(result.eventId, payload).subscribe({
        next: () => {
          this.snackBar.open('Assigned successfully', 'Close', { duration: 2000 });
          this.refreshed.emit();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to assign', 'Close', { duration: 3000 });
        }
      });
    });
  }

  getTodayAssignments(): number {
    if (!this.staff?.events?.length) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return this.staff.events.filter((event) => {
      const start = new Date(event.startDate).getTime();
      const end = new Date(event.endDate).getTime();
      return start < tomorrow.getTime() && end >= today.getTime();
    }).length;
  }

  isBusyToday(): boolean {
    const todayAssignments = this.getTodayAssignments();
    if (todayAssignments > 0) return true;

    const now = new Date().getTime();
    return this.staff?.events?.some((event) => {
      const status = event.status;
      return (status === 'Scheduled' || status === 'Ongoing') && new Date(event.endDate).getTime() >= now;
    }) || false;
  }

  getAvailabilityStatus(): string {
    return this.isBusyToday() ? 'busy-today' : 'available-today';
  }

  getAvailabilityLabel(): string {
    return this.isBusyToday() ? 'Busy today' : 'Available today';
  }

  getUpcomingEvents(): StaffEventSummary[] {
    if (!this.staff?.events?.length) return [];
    const now = new Date().getTime();
    return this.staff.events
      .filter((event) => new Date(event.endDate).getTime() >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  getNextEvent(): StaffEventSummary | null {
    return this.getUpcomingEvents()[0] || this.staff?.events?.[0] || null;
  }

  getPastPercentage(): number {
    if (!this.staff?.totalAssignments) return 0;
    return Math.round((this.staff.pastAssignments / this.staff.totalAssignments) * 100);
  }

  getActivePercentage(): number {
    if (!this.staff?.totalAssignments) return 0;
    return Math.round((this.staff.scheduledAssignments / this.staff.totalAssignments) * 100);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
      case 'Ongoing':
      case 'Completed':
      case 'Covered':
        return 'positive';
      case 'Draft':
        return 'neutral';
      case 'Cancelled':
      case 'Rejected':
      case 'Uncovered':
        return 'critical';
      default:
        return 'neutral';
      }
    }

  message(): void {
    this.snackBar.open('Message action not implemented', 'Close', { duration: 2000 });
  }

  getUtilizationPercentage(): number {
    const baseline = 5;
    if (!this.staff) return 0;
    const utilization = (this.staff.totalAssignments / baseline) * 100;
    return Math.min(Math.round(utilization), 100);
  }

  openEvent(eventId: string | undefined): void {
    if (!eventId) return;
    this.router.navigate(['/events', eventId]);
  }

}
