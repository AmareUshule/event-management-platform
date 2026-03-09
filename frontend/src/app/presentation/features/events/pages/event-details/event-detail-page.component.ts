// src/app/presentation/features/events/pages/event-detail-page.component.ts

import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import {
  Event,
  EventStatus,
  Assignment,
  EventAssignments,
  AssignmentPayload,
  ASSIGNMENT_ROLES,
  AssignmentUser
} from '../../models/event.model';

import { EventService } from '../../services/event.service';
import { AssignmentDialogComponent } from './assignment-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../confirmation-dialog.component';


@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './event-detail-page.component.html',
  styleUrls: ['./event-detail-page.component.scss']
})
export class EventDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private snackBar = inject(MatSnackBar);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  event: Event | null = null;
  loading = true;
  isLoading = false; // Add this for assignment loading state
  private isSubscribed = true;

  // Available roles for assignment - using the exported roles
  availableRoles: string[] = [
    ASSIGNMENT_ROLES.CAMERAMAN,
    ASSIGNMENT_ROLES.EXPERT,
  ];

  // Reference to EventStatus enum for template
  EventStatus = EventStatus;
  ASSIGNMENT_ROLES = ASSIGNMENT_ROLES; // Make available in template

  constructor() { }

  ngOnInit(): void {
    this.loadEventData();
  }

  ngOnDestroy(): void {
    this.isSubscribed = false;
  }

  private loadEventData(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { event?: Event };

    if (state?.event) {
      this.setEventFromState(state.event);
    } else if (eventId) {
      this.fetchEventDetails(eventId);
    } else {
      this.handleNoEventFound();
    }
  }

  private setEventFromState(event: Event): void {
    setTimeout(() => {
      if (this.isSubscribed) {
        this.event = event;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchEventDetails(id: string): void {
    this.loading = true;
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        if (this.isSubscribed) {
          this.event = event;
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        if (this.isSubscribed) {
          this.loading = false;
          this.showError('Failed to load event details');
          this.cdr.detectChanges();
        }
        console.error('Error fetching event:', error);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }


  // Add this method to your EventDetailPageComponent class

  approveEvent(): void {
  if (!this.event?.id) return;

  const dialogData: ConfirmationDialogData = {
    title: 'Approve Event',
    message: `Are you sure you want to approve "${this.event.title}"?`,
    confirmText: 'Approve',
    cancelText: 'Cancel',
    icon: 'check_circle',
    color: 'primary'
  };

  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '400px',
    disableClose: true,
    data: dialogData
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.isLoading = true;
      this.eventService.approveEvent(this.event!.id).subscribe({
        next: (updatedEvent) => {
          this.isLoading = false;
          this.event = updatedEvent;
          this.showSuccess('Event approved successfully!');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.message || 'Failed to approve event');
        }
      });
    }
  });
}

  



  private refreshEventData(): void {
    if (this.event?.id) {
      this.fetchEventDetails(this.event.id);
    }
  }

  downloadICS(): void {
    if (!this.event) return;
    this.generateICS();
  }

  private generateICS(): void {
    const event = this.event!;

    try {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      const formatDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Event Management//EN',
        'BEGIN:VEVENT',
        `UID:${event.id}@eventmanagement.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${this.escapeICSText(event.title)}`,
        `LOCATION:${this.escapeICSText(event.eventPlace)}`,
        `DESCRIPTION:${this.escapeICSText(event.description || 'Event details')}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.showSuccess('Calendar file downloaded successfully!');
    } catch (error) {
      console.error('Error generating ICS:', error);
      this.showError('Failed to generate calendar file');
    }
  }

  private escapeICSText(text: string): string {
    return text.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
  }

  shareEvent(): void {
    if (!this.event) return;

    const shareData = {
      title: this.event.title,
      text: this.event.description || 'Check out this event',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.showSuccess('Link copied to clipboard!');
      }).catch(() => {
        this.showError('Failed to copy link');
      });
    }
  }

  openInMaps(): void {
    if (!this.event?.eventPlace) return;

    const query = encodeURIComponent(this.event.eventPlace);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  }

  getDirections(): void {
    this.openInMaps();
  }

  // Assignment methods
  getAssignmentsByRole(role: string): Assignment[] {
    if (!this.event?.assignments) return [];
    return this.event.assignments[role as keyof EventAssignments] || [];
  }

  hasAssignments(role: string): boolean {
    return this.getAssignmentsByRole(role).length > 0;
  }

  getActiveRoles(): string[] {
    if (!this.event?.assignments) return [];
    return Object.keys(this.event.assignments).filter(role =>
      this.event!.assignments![role as keyof EventAssignments]?.length > 0
    );
  }

  getTotalAssignments(): number {
    if (!this.event?.assignments) return 0;
    return Object.values(this.event.assignments).reduce((total, assignments) =>
      total + (assignments?.length || 0), 0
    );
  }

  formatRoleName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  assignEmployee(): void {
    if (!this.event?.id) return;

    const dialogRef = this.dialog.open(AssignmentDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      data: {
        eventId: this.event.id,
        eventTitle: this.event.title,
        existingAssignments: this.event.assignments || {},
        availableRoles: this.availableRoles
      }
    });

    dialogRef.afterClosed().subscribe((result: AssignmentPayload[]) => {
      if (result && result.length > 0) {
        this.saveAssignments(result);
      }
    });
  }

  // FIXED: saveAssignments method - uses the correct service method
  saveAssignments(assignments: AssignmentPayload[]): void {
    if (!assignments || assignments.length === 0) return;

    this.isLoading = true;

    // Use the new method that handles multiple assignments by sending them one by one
    this.eventService.assignMultipleEmployees(this.event!.id, assignments).subscribe({
      next: (results) => {
        this.isLoading = false;
        this.showSuccess(`${results.length} personnel assigned successfully`);
        this.refreshEventData(); // Refresh to get updated assignments
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Assignment error:', error);

        // Show detailed error message
        let errorMsg = 'Failed to assign personnel';
        if (error.message) {
          errorMsg = error.message;
        } else if (error.errors) {
          errorMsg = Object.values(error.errors).join(', ');
        }

        this.showError(errorMsg);
      }
    });
  }

  removeAssignment(role: string, assignmentId: string): void {
    if (!this.event?.id || !confirm('Are you sure you want to remove this assignment?')) return;

    // Map display role to backend role format
    const backendRole = role.toLowerCase();

    this.eventService.removeAssignment(this.event.id, backendRole, assignmentId).subscribe({
      next: (updatedEvent: Event) => {
        this.showSuccess('Assignment removed successfully');
        this.event = updatedEvent;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error removing assignment:', error);
        this.showError(error.message || 'Failed to remove assignment');
      }
    });
  }

  // Helper method to check if a specific role has assignments
  hasRoleAssignments(role: string): boolean {
    const backendRole = role.toLowerCase();
    return this.hasAssignments(backendRole);
  }

  // Get assignments for a specific role
  getRoleAssignments(role: string): Assignment[] {
    const backendRole = role.toLowerCase();
    return this.getAssignmentsByRole(backendRole);
  }

  getAssigneeName(role: string, assignmentId: string): string {
    const backendRole = role.toLowerCase();
    const assignments = this.getAssignmentsByRole(backendRole);
    const assignment = assignments.find(a => a.id === assignmentId);

    if (!assignment) return 'Unknown';

    // Backend sends name directly at root level
    if (assignment.name) {
      return assignment.name;
    }

    // Fallback to employee object if it exists
    return this.getAssignmentUserDisplayName(assignment.employee) || 'Unknown';
  }

  getAssignedByName(role: string, assignmentId: string): string {
    const backendRole = role.toLowerCase();
    const assignments = this.getAssignmentsByRole(backendRole);
    const assignment = assignments.find(a => a.id === assignmentId);

    if (!assignment?.assignedBy) return 'Unknown';

    // Backend sends name directly in assignedBy
    if (assignment.assignedBy.name) {
      return assignment.assignedBy.name;
    }

    return this.getAssignmentUserDisplayName(assignment.assignedBy) || 'Unknown';
  }

  getAssignmentUserDisplayName(user?: AssignmentUser): string {
    if (!user) return '';
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return 'Unknown';
  }

  // Helper methods for template
  isDraft(): boolean {
    return this.event?.status === EventStatus.DRAFT;
  }

  isScheduled(): boolean {
    return this.event?.status === EventStatus.SCHEDULED;
  }

  isCompleted(): boolean {
    return this.event?.status === EventStatus.COMPLETED;
  }

  canAssignEmployees(): boolean {
    // Can assign if event is not completed or cancelled
    return this.event?.status !== EventStatus.COMPLETED &&
      this.event?.status !== EventStatus.CANCELLED;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private handleNoEventFound(): void {
    this.loading = false;
    this.showError('Event not found');
    this.cdr.detectChanges();
  }
}