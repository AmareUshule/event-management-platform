// src/app/presentation/features/events/pages/event-detail-page.component.ts

import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { FileSizePipe } from '../../../../../shared/pipes/file-size.pipe';
import { MediaService } from '../../../../../core/services/media.service';

import {
  Event,
  EventStatus,
  Assignment,
  EventAssignments,
  AssignmentPayload,
  ASSIGNMENT_ROLES,
  AssignmentUser,
  MediaFile,
  MediaType,
  EventFormData,
  EventType
} from '../../models/event.model';

import { EventService } from '../../services/event.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { environment } from '../../../../../../environments/environment';
import { AssignmentDialogComponent } from './assignment-dialog.component';
import { RequestDateChangeDialogComponent } from './request-date-change-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../confirmation-dialog.component';
import { ImageLightboxComponent } from '../../../../../shared/components/image-lightbox/image-lightbox.component';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FileSizePipe,
  ],
  templateUrl: './event-detail-page.component.html',
  styleUrls: ['./event-detail-page.component.scss']
})
export class EventDetailPageComponent implements OnInit, OnDestroy {
  public route = inject(ActivatedRoute);
  public router = inject(Router);
  public location = inject(Location);
  public snackBar = inject(MatSnackBar);
  public eventService = inject(EventService);
  public mediaService = inject(MediaService);
  public cdr = inject(ChangeDetectorRef);
  public dialog = inject(MatDialog);
  public authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  event: Event | null = null;
  loading = true;
  isLoading = false; 
  mediaFiles: MediaFile[] = [];
  selectedFilter: string = 'all';
  selectedTabIndex = 0;
  isSubscribed = true;

  // Available roles for assignment - using the exported roles
  availableRoles: string[] = [
    ASSIGNMENT_ROLES.CAMERAMAN,
    ASSIGNMENT_ROLES.EXPERT,
  ];

  // Reference to EventStatus enum for template
  EventStatus = EventStatus;
  ASSIGNMENT_ROLES = ASSIGNMENT_ROLES; 

  // --- Media categorization controls ---
  mediaCategories: any[] = [];
  mediaSubCategories: any[] = [];
  filteredCategories!: Observable<any[]>;
  filteredSubCategories!: Observable<any[]>;
  categoryControl = new FormControl<any | null>(null);
  subCategoryControl = new FormControl<any | null>(null);

  constructor() { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.applyRequestedTab();
      this.loadEventData();
      this.setupCategoryControls();
    }
  }

  ngOnDestroy(): void {
    this.isSubscribed = false;
  }

  private setupCategoryControls(): void {
    this.mediaService.getMediaCategories().subscribe(cats => this.mediaCategories = cats);

    this.filteredCategories = this.categoryControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(this.mediaCategories, name) : this.mediaCategories.slice();
      })
    );

    this.categoryControl.valueChanges.subscribe(category => {
      this.subCategoryControl.setValue(null);
      this.mediaSubCategories = [];
      if (category && typeof category !== 'string' && category.id) {
        this.mediaService.getSubCategories(category.id).subscribe(subCats => {
          this.mediaSubCategories = subCats;
          this.subCategoryControl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
        });
      }
    });

    this.filteredSubCategories = this.subCategoryControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(this.mediaSubCategories, name) : this.mediaSubCategories.slice();
      })
    );
  }

  private _filter<T extends { name: string }>(items: T[], value: string): T[] {
    const filterValue = value.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  displayCategory(category: any): string {
    return category?.name || '';
  }

  displaySubCategory(subCategory: any): string {
    return subCategory?.name || '';
  }

  private loadEventData(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { event?: Event };

    if (state?.event) {
      this.setEventFromState(state.event);
      if (this.event?.id) this.loadMedia(this.event.id);
    } else if (eventId) {
      this.fetchEventDetails(eventId);
      this.loadMedia(eventId);
    } else {
      this.handleNoEventFound();
    }
  }

  private applyRequestedTab(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab')?.toLowerCase();
    if (tab === 'staff') {
      this.selectedTabIndex = 1;
    } else if (tab === 'media') {
      this.selectedTabIndex = 2;
    } else {
      this.selectedTabIndex = 0;
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
        this.loading = false;
        this.showError(error.message || 'Failed to fetch event details');
        this.cdr.detectChanges();
      }
    });
  }

  loadMedia(id: string): void {
    this.eventService.getEventMedia(id).subscribe({
      next: (media) => {
        this.mediaFiles = media;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading media:', error);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  approveEvent(): void {
    if (!this.event?.id) return;

    const eventId = this.event.id;
    const dialogData: ConfirmationDialogData = {
      title: 'Approve Event',
      message: `Are you sure you want to approve "${this.event.title}"? This will move it to Scheduled status.`,
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
        this.eventService.approveEvent(eventId).subscribe({
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

  finalizeEvent(): void {
    if (!this.event?.id) return;
    
    const eventId = this.event.id;
    const comment = prompt('Enter final closure comment (mandatory):');
    if (!comment || comment.trim() === '') {
      this.showError('Closure comment is required');
      return;
    }

    // Check if all staff are verified
    const allAssignments = [
      ...this.getAssignmentsByRole('cameraman'),
      ...this.getAssignmentsByRole('expert')
    ];
    
    const unverifiedAssignments = allAssignments.filter(a => 
      a.status === 'Accepted' || a.status === 'Submitted' || a.status === 'RevisionRequested'
    );

    let allowOverride = false;
    if (unverifiedAssignments.length > 0) {
      const msg = `There are ${unverifiedAssignments.length} assignments not yet verified by the creator. Do you want to override and finalize anyway?`;
      if (confirm(msg)) {
        allowOverride = true;
      } else {
        return;
      }
    }

    this.isLoading = true;
    this.eventService.finalizeEvent(eventId, comment, allowOverride).subscribe({
      next: (updatedEvent) => {
        this.isLoading = false;
        this.event = updatedEvent;
        this.showSuccess('Event concluded successfully!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to conclude event');
      }
    });
  }

  submitCoverage(assignmentId: string): void {
    if (!this.event?.id) return;
    
    if (!confirm('Are you sure you want to submit coverage for verification? This confirms you have completed your work.')) return;

    this.isLoading = true;
    this.eventService.submitCoverage(this.event.id, assignmentId).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Coverage submitted for verification');
        this.refreshEventData();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to submit coverage');
      }
    });
  }

  verifyCoverage(assignmentId: string, isApproved: boolean): void {
    if (!this.event?.id) return;
    
    const action = isApproved ? 'verify' : 'request revision for';
    const note = prompt(`Enter ${isApproved ? 'optional verification note' : 'mandatory revision reason'}:`);
    
    if (!isApproved && (!note || note.trim() === '')) {
      this.showError('Revision reason is required');
      return;
    }

    this.isLoading = true;
    this.eventService.verifyCoverage(this.event.id, assignmentId, isApproved, note || undefined).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess(`Coverage ${isApproved ? 'verified' : 'revision requested'}`);
        this.refreshEventData();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to update verification status');
      }
    });
  }

  canSubmitCoverage(assignment: Assignment): boolean {
    if (!this.event || (this.event.status !== EventStatus.ONGOING && this.event.status !== EventStatus.COMPLETED)) return false;
    
    const userId = this.authService.getCurrentUser()?.adObjectId;
    const isAssigned = assignment.employee?.id === userId || assignment.employeeId === userId;
    const correctStatus = assignment.status === 'Accepted' || assignment.status === 'RevisionRequested';
    
    return isAssigned && correctStatus;
  }

  canVerifyCoverage(assignment: Assignment): boolean {
    if (!this.event || (this.event.status !== EventStatus.ONGOING && this.event.status !== EventStatus.COMPLETED)) return false;
    
    const userId = this.authService.getCurrentUser()?.adObjectId;
    const isCreator = this.event.createdBy?.id === userId;
    const isAdmin = this.authService.isAdmin();
    const isCommManager = this.authService.isCommunicationManager();
    const isSubmitted = assignment.status === 'Submitted';
    
    // Management (Admin/Comm Manager) can override and verify even if not submitted
    if (isAdmin || isCommManager) return true;
    
    // Creator can only verify if it's submitted
    return isCreator && isSubmitted;
  }

  cancelEvent(): void {
    if (!this.event?.id) return;
    
    const isDraft = this.event.status === EventStatus.DRAFT;
    
    const eventId = this.event.id;
    const comment = prompt(`Enter reason for ${isDraft ? 'cancellation' : 'cancellation request'} (mandatory):`);
    
    if (!comment || comment.trim() === '') {
      this.showError('Reason is required');
      return;
    }

    this.isLoading = true;
    
    const operation = isDraft 
      ? this.eventService.cancelEvent(eventId, comment)
      : this.eventService.requestCancellation(eventId, comment);

    operation.subscribe({
      next: (updatedEvent) => {
        this.isLoading = false;
        this.event = updatedEvent;
        this.showSuccess(isDraft ? 'Event cancelled successfully' : 'Cancellation request submitted');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || `Failed to ${isDraft ? 'cancel event' : 'request cancellation'}`);
      }
    });
  }

  approveCancellationRequest(): void {
    if (!this.event?.id) return;

    const comment = prompt('Optional review comment:') || '';

    this.isLoading = true;
    this.eventService.approveCancellationRequest(this.event.id, comment).subscribe({
      next: (updatedEvent) => {
        this.isLoading = false;
        this.event = updatedEvent;
        this.showSuccess('Cancellation request approved');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to approve cancellation request');
      }
    });
  }

  rejectCancellationRequest(): void {
    if (!this.event?.id) return;

    const comment = prompt('Optional rejection comment:') || '';

    this.isLoading = true;
    this.eventService.rejectCancellationRequest(this.event.id, comment).subscribe({
      next: (updatedEvent) => {
        this.isLoading = false;
        this.event = updatedEvent;
        this.showSuccess('Cancellation request rejected');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to reject cancellation request');
      }
    });
  }

  onFileUpload(event: any, fileType: string): void {
    if (!this.event?.id) return;
    const eventId = this.event.id;

    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showError('File size exceeds 5MB limit');
      return;
    }

    const subCategoryId = this.subCategoryControl.value?.id;
    this.isLoading = true;
    this.eventService.uploadMedia(eventId, fileType, file, undefined, subCategoryId).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Media uploaded successfully');
        this.loadMedia(eventId);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to upload media');
      }
    });
  }

  addExternalLink(): void {
    if (!this.event?.id) return;
    const eventId = this.event.id;

    const url = prompt('Enter external link URL:');
    if (!url) return;

    const subCategoryId = this.subCategoryControl.value?.id;
    this.isLoading = true;
    this.eventService.uploadMedia(eventId, 'Link', undefined, url, subCategoryId).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Link added successfully');
        this.loadMedia(eventId);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to add link');
      }
    });
  }
  
  editEvent(): void {
    if (!this.event?.id) {
      return;
    }

    const eventId = this.event.id;

    // RBAC check: Admin, Communication Manager, Dept Manager, or Creator
    const user = this.authService.getCurrentUser();
    const isCommManager = this.authService.isCommunicationManager();
    const isDeptManager = this.authService.isManager() && user?.departmentGuid === this.event.department?.id;
    const isCreator = this.event.createdBy?.id === user?.adObjectId;

    const canEdit = this.authService.isAdmin() || isCommManager || isDeptManager || isCreator;

    // Only allow editing in Draft state, and only for creator, admin, comm manager, or dept manager
    this.router.navigate(['/events/edit', this.event.id]);
  }

  canEditDateLocation(): boolean {
    if (!this.event || this.isConcluded() || this.event.status === EventStatus.CANCELLED || this.event.dateChangeRequestStatus === 'Pending') {
      return false;
    }

    const user = this.authService.getCurrentUser();
    const isAdmin = this.authService.isAdmin();
    const isCreator = this.event.createdBy?.id === user?.adObjectId;
    const isDeptManager = this.authService.isManager() && user?.departmentGuid === this.event.department?.id;

    // Admin can always initiate changes (will be direct).
    // Creator or Dept Manager can initiate changes (will be request if Scheduled).
    // Communication Manager can only approve (unless they are the Admin or Creator).
    return isAdmin || isCreator || isDeptManager;
  }

  openDateLocationEdit(): void {
    if (!this.event) return;

    const isAdmin = this.authService.isAdmin();
    const isDraft = this.isDraft();

    const dialogRef = this.dialog.open(RequestDateChangeDialogComponent, {
      width: '500px',
      data: {
        eventTitle: this.event.title,
        currentStartDate: this.event.startDate,
        currentEndDate: this.event.endDate,
        currentEventPlace: this.event.eventPlace,
        isDraft: isDraft || isAdmin // Admin treats it as a direct edit even if not Draft
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isDraft || isAdmin) {
          this.performDirectDateUpdate(result);
        } else {
          this.performRequestDateChange(result);
        }
      }
    });
  }

  private performDirectDateUpdate(data: any): void {
    if (!this.event?.id) return;
    this.isLoading = true;
    
    // Map the status correctly for direct updates
    // If it's already Scheduled/Ongoing, keep that status
    const currentStatus = this.event.status as EventStatus;

    const updatePayload: any = {
      id: this.event.id,
      title: this.event.title,
      description: this.event.description,
      startDate: data.proposedStartDate,
      endDate: data.proposedEndDate,
      eventPlace: data.proposedEventPlace,
      status: currentStatus
    };

    // Need to use the raw HTTP put or update EventService to accept these fields easily
    this.eventService.updateEvent(this.event.id, {
      startDateTime: data.proposedStartDate,
      endDateTime: data.proposedEndDate,
      address: data.proposedEventPlace,
      eventType: EventType.PHYSICAL
    }, currentStatus).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccess('Event schedule updated directly');
        this.refreshEventData();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to update event directly');
      }
    });
  }

  private performRequestDateChange(data: any): void {
    if (!this.event?.id) return;
    this.isLoading = true;

    this.eventService.requestDateChange(this.event.id, {
      proposedStartDate: data.proposedStartDate,
      proposedEndDate: data.proposedEndDate,
      proposedEventPlace: data.proposedEventPlace,
      reason: data.reason
    }).subscribe({
      next: (updatedEvent) => {
        this.isLoading = false;
        this.event = updatedEvent;
        this.showSuccess('Date change request submitted');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to submit date change request');
      }
    });
  }

  canReviewDateChange(): boolean {
    return this.event?.dateChangeRequestStatus === 'Pending' &&
      (this.authService.isAdmin() || this.authService.isCommunicationManager());
  }

  approveDateChangeRequest(): void {
    if (!this.event?.id) return;
    const comment = prompt('Optional approval comment:') || '';
    
    this.isLoading = true;
    this.eventService.reviewDateChange(this.event.id, true, comment).subscribe({
      next: (updatedEvent) => {
        this.isLoading = false;
        this.event = updatedEvent;
        this.showSuccess('Date change request approved');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to approve date change request');
      }
    });
  }

  rejectDateChangeRequest(): void {
    if (!this.event?.id) return;
    const comment = prompt('Reason for rejection (mandatory):');
    if (!comment || comment.trim() === '') {
      this.showError('Rejection reason is required');
      return;
    }

    this.isLoading = true;
    this.eventService.reviewDateChange(this.event.id, false, comment).subscribe({
      next: (updatedEvent) => {
        this.isLoading = false;
        this.event = updatedEvent;
        this.showSuccess('Date change request rejected');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.message || 'Failed to reject date change request');
      }
    });
  }

  canApprove(): boolean {
    if (!this.event || this.event.status !== EventStatus.DRAFT || this.isCancellationPending()) return false;
    return this.authService.isAdmin() || this.authService.isCommunicationManager();
  }

  canFinalize(): boolean {
    if (!this.event || this.event.status !== EventStatus.COMPLETED) return false;
    return this.authService.isAdmin() || this.authService.isCommunicationManager();
  }

  isCancellationPending(): boolean {
    return this.event?.cancellationRequestStatus === 'Pending';
  }

  canRequestCancellation(): boolean {
    if (!this.event?.id || this.isCancellationPending()) return false;

    // Only allow requesting cancellation for SCHEDULED events
    // (Ongoing events cannot be cancelled as per updated requirements)
    if (this.event.status !== EventStatus.SCHEDULED) return false;

    const userId = this.authService.getCurrentUser()?.adObjectId;
    const isCreator = !!userId && this.event.createdBy?.id === userId;

    return this.authService.isAdmin() || isCreator;
  }

  canCancelDirectly(): boolean {
    if (!this.event?.id || this.isCancellationPending()) return false;

    // Direct cancellation is only for DRAFT events
    if (this.event.status !== EventStatus.DRAFT) return false;

    return this.authService.isAdmin() || this.authService.isCommunicationManager();
  }

  canReviewCancellation(): boolean {
    return this.isCancellationPending() &&
      (this.authService.isAdmin() || this.authService.isCommunicationManager());
  }

  canUploadMedia(): boolean {
    if (!this.event) return false;
    
    const status = this.event.status;
    const canUploadStatus = status === EventStatus.SCHEDULED || 
                           status === EventStatus.ONGOING || 
                           status === EventStatus.COMPLETED || 
                           status === EventStatus.COVERED;
    
    if (!canUploadStatus) return false;
    
    if (this.authService.isAdmin()) return true;
    
    // Check if current user is an assigned staff who is in an active or terminal upload-eligible status
    const userId = this.authService.getCurrentUser()?.adObjectId;
    if (!userId) return false;

    const allAssignments = [
      ...this.getAssignmentsByRole('cameraman'),
      ...this.getAssignmentsByRole('expert')
    ];

    return allAssignments.some(a => 
      (a.employee?.id === userId || a.employeeId === userId) && 
      (a.status === 'Accepted' || 
       a.status === 'Submitted' || 
       a.status === 'Covered' || 
       a.status === 'VerifiedByCreator' || 
       a.status === 'RevisionRequested')
    );
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
  const event = this.event;
  const assignments = event?.assignments;

  if (!assignments) return [];

  return Object.keys(assignments).filter(role => {
    const value = assignments[role as keyof EventAssignments];
    return Array.isArray(value) && value.length > 0;
  });
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

    const eventId = this.event.id;
    const eventTitle = this.event.title;
    const existingAssignments = this.event.assignments || {};

    const dialogRef = this.dialog.open(AssignmentDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      data: {
        eventId: eventId,
        eventTitle: eventTitle,
        existingAssignments: existingAssignments,
        availableRoles: this.availableRoles
      }
    });

    dialogRef.afterClosed().subscribe((result: AssignmentPayload[]) => {
      if (result && result.length > 0) {
        this.saveAssignments(result);
      }
    });
  }

  // FIXED: saveAssignments method - uses the correct service method and handles nested error objects
  saveAssignments(assignments: AssignmentPayload[]): void {
    if (!assignments || assignments.length === 0 || !this.event?.id) return;

    const eventId = this.event.id;
    this.isLoading = true;

    // Use the new method that handles multiple assignments by sending them one by one
    this.eventService.assignMultipleEmployees(eventId, assignments).subscribe({
      next: (results) => {
        this.isLoading = false;
        this.showSuccess(`${results.length} personnel assigned successfully`);
        
        // DO NOT set this.event to results since results is an array of Assignments
        this.refreshEventData(); // Refresh to get fully updated event state from server
        this.cdr.detectChanges();
      },
      error: (errorWrapper) => {
        this.isLoading = false;
        console.error('Assignment error:', errorWrapper);

        // Handle the nested error object from forkJoin catch in service
        let errorMsg = 'Failed to assign personnel';
        
        // Check for nested error from our service wrapper
        const actualError = errorWrapper.error || errorWrapper;
        
        if (actualError.message) {
          errorMsg = actualError.message;
        } else if (actualError.errors) {
          errorMsg = Object.values(actualError.errors).join(', ');
        }

        this.showError(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

  removeAssignment(role: string, assignmentId: string): void {
    if (!this.event?.id || !confirm('Are you sure you want to remove this assignment?')) return;

    const eventId = this.event.id;
    // Map display role to backend role format
    const backendRole = role.toLowerCase();

    this.eventService.removeAssignment(eventId, backendRole, assignmentId).subscribe({
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

  getCountdown(): string {
    if (!this.event) return '';
    const start = new Date(this.event.startDate).getTime();
    const now = new Date().getTime();
    const diff = start - now;
    
    if (diff <= 0) {
      const end = new Date(this.event.endDate).getTime();
      if (now < end) return 'Currently Ongoing';
      return 'Event Concluded';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    return `Starts in ${hours}h`;
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
    const status = this.event?.status;
    return status === EventStatus.COMPLETED || 
           status === EventStatus.COVERED || 
           status === EventStatus.UNCOVERED;
  }

  isConcluded(): boolean {
    const status = this.event?.status;
    return status === EventStatus.COVERED || 
           status === EventStatus.UNCOVERED;
  }

  isStaff(): boolean {
    return this.authService.isStaff();
  }

  canAssignEmployees(): boolean {
    // Only Admin or Communication Manager can assign staff,
    // and only while the event is in an active/pre-terminal state
    if (!this.event) {
      return false;
    }

    const isFinal =
      this.event.status === EventStatus.COMPLETED ||
      this.event.status === EventStatus.CANCELLED ||
      this.event.status === EventStatus.COVERED ||
      this.event.status === EventStatus.UNCOVERED;

    const canAssign =
      this.authService.isAdmin() ||
      this.authService.isCommunicationManager();

    return !isFinal && canAssign;
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

  // Media filtering and display methods
  get filteredMedia(): MediaFile[] {
    if (this.selectedFilter === 'all') {
      return this.mediaFiles;
    }
    return this.mediaFiles.filter(m => m.fileType === this.selectedFilter);
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  getMediaCount(type: string): number {
    return this.mediaFiles.filter(m => m.fileType === type).length;
  }

  getTotalFileSize(): number {
    return this.mediaFiles.reduce((total, media) => total + (media.fileSize || 0), 0);
  }

  isImage(media: MediaFile): boolean {
    if (!media || !media.fileType) return false;
    return media.fileType.toString().toLowerCase() === 'image';
  }

  getMediaIcon(type: MediaType | string): string {
    if (!type) return 'insert_drive_file';
    const t = type.toString().toLowerCase();
    switch (t) {
      case 'image': return 'image';
      case 'video': return 'videocam';
      case 'document': return 'description';
      case 'link': return 'link';
      default: return 'insert_drive_file';
    }
  }

  getMediaCardClass(media: MediaFile): string {
    const type = media.fileType?.toString().toLowerCase() || 'unknown';
    return `media-card-${type}`;
  }

  canDeleteMedia(media: MediaFile): boolean {
    if (!media) return false;
    
    // Admin can delete any media
    if (this.authService.isAdmin()) return true;
    
    // User can delete their own uploads
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.adObjectId === media.uploadedBy;
  }

  deleteMedia(media: MediaFile, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (!confirm(`Are you sure you want to delete "${media.fileName}"?`)) {
      return;
    }

    this.eventService.deleteMedia(media.id).subscribe({
      next: () => {
        this.showSuccess('Media deleted successfully');
        this.mediaFiles = this.mediaFiles.filter(m => m.id !== media.id);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting media:', error);
        this.showError('Failed to delete media');
      }
    });
  }

  getMediaUrl(media: any): string {
    if (!media || !media.filePath) return '';
    
    const type = media.fileType?.toString().toLowerCase();
    if (type === 'link') {
      return media.filePath;
    }
    
    if (media.filePath.startsWith('http')) {
      return media.filePath;
    }

    // Ensure environment.apiUrl exists and handle potential missing slashes
    const apiBase = environment.apiUrl || '';
    const baseUrl = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
    const filePath = media.filePath.startsWith('/') ? media.filePath.substring(1) : media.filePath;
    
    return `${baseUrl}${filePath}`;
  }

  openMediaViewer(media: MediaFile, allMedia: MediaFile[], index: number): void {
    if (media.fileType === MediaType.IMAGE) {
      // Open image in lightbox
      this.openImageLightbox(media, allMedia, index);
    } else {
      // For other types, open in new tab
      window.open(this.getMediaUrl(media), '_blank');
    }
  }

  private openImageLightbox(clickedMedia: MediaFile, allMedia: MediaFile[], clickedIndex: number): void {
    // Filter for only the image items to show in the lightbox navigation
    const imageItems = allMedia.filter(m => this.isImage(m));
    const lightboxIndex = imageItems.findIndex(item => item.id === clickedMedia.id);

    this.dialog.open(ImageLightboxComponent, {
      panelClass: 'gallery-lightbox-dialog', // Use the same class as the gallery
      data: {
        items: imageItems.map(item => ({
          imageUrl: this.getMediaUrl(item),
          title: item.fileName,
          fileName: item.fileName
        })),
        currentIndex: lightboxIndex >= 0 ? lightboxIndex : 0
      }
    });
  }
}
