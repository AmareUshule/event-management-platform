// src/app/presentation/features/dashboard/dashboard.component.ts

import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// Layouts
import { HeaderComponent } from '../../layouts/header/header.component';

// Services
import { AuthService } from '../../../core/auth/auth.service';
import { EventService } from '../events/services/event.service';
import { ReportService, ReportSummary } from '../../../core/services/report.service';
import { AnnouncementService } from '../internal-announcements/services/announcement.service';

// Models
import { Event, EventFormData, EventStatus, AssignmentResponse } from '../events/models/event.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { Announcement } from '../internal-announcements/models/announcement.model';

// Interface for table display
export interface TableEvent {
  id: string;
  name: string;
  location: string;
  date: Date;
  status: string;
  departmentName: string;
  createdByName: string;
  raw: Event;
}

// Interface for agenda items
export interface AgendaItem {
  time: string;
  title: string;
  location: string;
  icon?: string;
}

@Component({
  selector: 'app-dashboard',
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
    MatMenuModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    HeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ==================== MASTER DATA (SOURCE OF TRUTH - NEVER MODIFIED) ====================
  private masterEvents: Event[] = [];           // Raw events from API - NEVER TOUCH AFTER SET
  private masterTableEvents: TableEvent[] = []; // Transformed events - NEVER MODIFY AFTER SET
  upcomingEvents: Event[] = [];                 // Upcoming events from API
  myAssignments: AssignmentResponse[] = [];     // Assignments for Expert/Cameraman
  reportSummary: ReportSummary | null = null;   // Report summary from API
  latestAnnouncements: Announcement[] = [];     // Latest announcements (preview)
  isLoadingAnnouncements = false;

  // ==== FILTERED DATA (FOR DISPLAY - MODIFIED BY FILTERS ONLY) =======
  filteredEvents: TableEvent[] = [];              
  paginatedEvents: TableEvent[] = [];            

  // ====== PAGINATION STATE =========
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  // ===== UI STATE =======
  user: AuthUser | null = null;
  isLoadingEvents = true;
  isLoadingAssignments = false;
  isLoadingReport = false;
  currentDate = new Date();
  activeTab: string = 'all';
  searchTerm: string = '';
  isMobileMenuOpen = false;
    

  // ======== TABLE CONFIGURATION ============
  displayedColumns: string[] = ['id', 'eventName', 'location', 'date', 'actions'];
  assignmentColumns: string[] = ['id', 'eventTitle', 'date', 'role', 'status', 'actions'];

  // =========== STATISTICS (DERIVED FROM MASTER DATA) =============
  totalEvents = 0;
  scheduledEvents = 0;
  draftEventsCount = 0;
  submittedEvents = 0;
  ongoingEvents = 0;
  pastEventsCount = 0;
  eventsThisWeek = 0;
  assignedEventsCount = 0;
  pendingAssignmentsCount = 0;
  pendingApprovals = 0;

  // ============ INSIGHTS (DERIVED FROM MASTER DATA) ============
  upcomingEventsCount = 0;
  pendingApprovalsCount = 0;

  // ============ AGENDA (DERIVED FROM MASTER DATA) ============
  agendaItems: AgendaItem[] = [];

  // =========== CLEANUP =============
  private destroy$ = new Subject<void>();

  // ========== DEPENDENCY INJECTION ==========
  authService = inject(AuthService);
  private eventService = inject(EventService);
  private reportService = inject(ReportService);
  private announcementService = inject(AnnouncementService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  // Department mapping
  private departmentMap: Record<number, string> = {
    1: 'Information Technology',
    2: 'Human Resources',
    3: 'Finance',
    4: 'Marketing',
    5: 'Operations',
    6: 'Communication',
    7: 'General Staff'
  };

  // ==================== LIFECYCLE HOOKS ====================

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeComponent();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeComponent(): void {
    if (!this.checkAuthentication()) return;

    this.user = this.authService.getCurrentUser();
    this.loadEvents();
    this.loadUpcomingEvents();
    this.loadLatestAnnouncements();
    if (this.isStaff()) {
      this.loadMyAssignments();
    }
    
    // Admins, Managers, Experts, and Cameramen should load report summary
    if (this.authService.isAdmin() || this.authService.isManager() || this.isStaff()) {
      this.loadReportSummary();
    }
    this.setDefaultAgenda();
  }

  private checkAuthentication(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  private setDefaultAgenda(): void {
    this.agendaItems = [
      {
        time: '10:00 AM',
        title: 'Team Meeting',
        location: 'Conference Room A',
        icon: 'meeting_room'
      },
      {
        time: '02:00 PM',
        title: 'Client Presentation',
        location: 'Main Hall',
        icon: 'present_to_all'
      },
      {
        time: '04:30 PM',
        title: 'Vendor Review',
        location: 'Meeting Room 3',
        icon: 'business'
      }
    ];
  }

  // ==================== DATA LOADING ====================
  // LOADING: Only updates master data, never filtered data directly

  private loadEvents(): void {
    this.isLoadingEvents = true;

    this.eventService.getAllEvents()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingEvents = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (events) => {
          console.log('📥 Master events loaded:', events.length);
          this.setMasterData(events);
        },
      });
  }

  private loadUpcomingEvents(): void {
    this.eventService.getUpcomingEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.upcomingEvents = events;
          this.upcomingEventsCount = events.length;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load upcoming events:', error);
        }
      });
  }

  private loadMyAssignments(): void {
    this.isLoadingAssignments = true;
    this.eventService.getMyAssignments()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingAssignments = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (assignments) => {
          this.myAssignments = assignments;
          this.calculateStatistics();
        },
        error: (error) => {
          console.error('Failed to load my assignments:', error);
        }
      });
  }

  private loadReportSummary(): void {
    this.reportService.getReportSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.reportSummary = summary;
          this.updateStatsFromSummary(summary);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load report summary:', error);
        }
      });
  }

  private loadLatestAnnouncements(): void {
    this.isLoadingAnnouncements = true;
    this.announcementService.getPublishedAnnouncements(1, 3)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingAnnouncements = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.latestAnnouncements = response.items || [];
        },
        error: (error) => {
          console.error('Failed to load latest announcements:', error);
          this.latestAnnouncements = [];
        }
      });
  }

  private updateStatsFromSummary(summary: ReportSummary): void {
    this.totalEvents = summary.totalEvents;
    this.pendingApprovalsCount = summary.pendingApprovalsCount;
    this.assignedEventsCount = summary.assignedEventsCount;
    this.pendingAssignmentsCount = summary.pendingAssignmentsCount;
    
    // If events are already loaded, we prefer our local calculation.
    if (this.masterEvents.length > 0) {
      this.calculateStatistics();
    } else {
      this.scheduledEvents = summary.scheduledCount;
      this.pastEventsCount = summary.completedCount + summary.archivedCount;
    }
  }

  private setMasterData(events: Event[]): void {
    // 1. Set master raw events (never modify after this)
    this.masterEvents = events;

    // 2. Transform and set master table events (never modify after this)
    this.masterTableEvents = this.transformToTableEvents(events);

    // 3. Calculate all derived data from master
    this.calculateStatistics();
    this.updateInsights();
    
    this.updateEventsThisWeek();
    this.updateAgendaFromMaster();

    // 4. Apply current filters to populate filteredEvents and paginatedEvents for display
    this.applyFilters();
  }

  /**
   * PURE FUNCTION: Transforms events to table format without side effects
   */
  private transformToTableEvents(events: Event[]): TableEvent[] {
    return events.map(event => ({
      id: event.id || '',
      name: event.title,
      location: event.eventPlace,
      date: new Date(event.startDate),
      status: event.status as string,
      departmentName: event.department?.name || 'Unknown',
      createdByName: this.getFullName(event.createdBy),
      raw: event
    }));
  }

  private calculateStatistics(): void {
    const currentUserId = this.user?.adObjectId;
    this.totalEvents = this.masterEvents.length;
    
    // Drafts are specific to the current user
    this.draftEventsCount = this.masterEvents.filter(e => 
      e.status === "Draft" && e.createdBy.id === currentUserId).length;
      
    this.submittedEvents = this.masterEvents.filter(e => e.status === "Submitted").length;
    this.scheduledEvents = this.masterEvents.filter(e => e.status === "Scheduled").length;
    this.ongoingEvents = this.masterEvents.filter(e => e.status === "Ongoing").length;
    
    // Merged Past Events (Completed + Archived)
    this.pastEventsCount = this.masterEvents.filter(e => 
      e.status === "Completed" || e.status === "Archived").length;

    if (this.isStaff()) {
      this.assignedEventsCount = this.myAssignments.length;
      this.pendingAssignmentsCount = this.myAssignments.filter(a => a.status === "Pending").length;
      
      // For staff, statistics should only consider events where they are assigned.
      // We'll update the counts for Scheduled and Past based on their assignments.
      const assignedEventIds = new Set(this.myAssignments.map(a => a.eventId));
      
      this.scheduledEvents = this.masterEvents.filter(e => 
        e.status === "Scheduled" && assignedEventIds.has(e.id)).length;
        
      this.pastEventsCount = this.masterEvents.filter(e => 
        (e.status === "Completed" || e.status === "Archived") && assignedEventIds.has(e.id)).length;
    }
    
    this.updateEventsThisWeek();
  }

  private updateEventsThisWeek(): void {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (day === 0 ? -6 : 1) - day; // Monday as week start
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    this.eventsThisWeek = this.masterEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate >= startOfWeek && eventDate < endOfWeek;
    }).length;
  }

  /**
   * Update insights from master data
   */
  private updateInsights(): void {
    this.pendingApprovals = this.submittedEvents;
    this.pendingApprovalsCount = this.pendingApprovals;

    if (this.upcomingEvents.length === 0) {
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      this.upcomingEventsCount = this.masterEvents.filter(e => {
        const eventDate = new Date(e.startDate);
        return eventDate >= now && eventDate <= weekFromNow;
      }).length;
    }
  }

  /**
   * Update agenda from master data
   */
  private updateAgendaFromMaster(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysEventsList = this.masterEvents
      .filter(e => {
        const eventDate = new Date(e.startDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3);

    if (todaysEventsList.length > 0) {
      this.agendaItems = todaysEventsList.map(event => ({
        time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: event.title,
        location: event.eventPlace,
        icon: 'event'
      }));
    }
  }

  onStatCardClick(tab: string): void {
    this.onTabChange(tab);
    this.scrollToTable();
  }

  private scrollToTable(): void {
    const tableElement = document.querySelector('.table-section');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ==================== FILTERING ====================

  applySearch(event: any): void {
    const filterValue = event.target.value.toLowerCase().trim();
    this.searchTerm = filterValue;
    this.applyFilters();
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.masterTableEvents];

    if (this.activeTab === 'assignments') {
       this.filteredEvents = [];
       this.paginatedEvents = [];
       this.cdr.detectChanges();
       return;
    }

    switch (this.activeTab) {
      case 'draft': 
        filtered = filtered.filter(e => e.status === 'Draft' && e.raw.createdBy.id === this.user?.adObjectId);
        break;
      case 'submitted':
        filtered = filtered.filter(e => e.status === 'Submitted');
        break;
      case 'scheduled':
        filtered = filtered.filter(e => e.status === 'Scheduled');
        break;
      case 'ongoing':
        filtered = filtered.filter(e => e.status === 'Ongoing');
        break;
      case 'past':
        filtered = filtered.filter(e => e.status === 'Completed' || e.status === 'Archived');
        break;
      // case 'all': default
    }

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.departmentName.toLowerCase().includes(searchLower) ||
        event.createdByName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredEvents = filtered;
    this.currentPage = 0;
    this.updatePaginatedEvents();
    this.cdr.detectChanges();
  }

  // ==================== PAGINATION METHODS ====================

  private updatePaginatedEvents(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.pageSize);
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredEvents.length);
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginatedEvents();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedEvents();
    }
  }

  goToFirstPage(): void {
    this.currentPage = 0;
    this.updatePaginatedEvents();
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.updatePaginatedEvents();
  }

  onPageSizeChange(event: any): void {
    const newSize = parseInt(event.target.value, 10);
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0;
      this.updatePaginatedEvents();
    }
  }

  getCurrentPageEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredEvents.length);
  }

  filterByDate(range: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = this.masterTableEvents.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });

    this.filteredEvents = filtered;
    this.currentPage = 0;
    this.updatePaginatedEvents();
    this.cdr.detectChanges();

    this.snackBar.open(`Found ${filtered.length} event(s) for today`, 'Close', {
      duration: 3000
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.activeTab = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  // ==================== ACTIONS ====================

  acceptAssignment(assignment: AssignmentResponse): void {
    this.eventService.updateAssignmentStatus(assignment.eventId, assignment.id, 'Accepted')
      .subscribe({
        next: () => {
          this.snackBar.open('Assignment accepted', 'Close', { duration: 3000 });
          this.loadMyAssignments();
          this.loadEvents();
        },
        error: (err) => this.showError('Failed to accept assignment')
      });
  }

  declineAssignment(assignment: AssignmentResponse): void {
    const reason = prompt('Please provide a reason for declining:');
    if (reason === null) return; // Cancelled
    if (!reason.trim()) {
      this.showError('Decline reason is mandatory');
      return;
    }

    this.eventService.updateAssignmentStatus(assignment.eventId, assignment.id, 'Declined', reason)
      .subscribe({
        next: () => {
          this.snackBar.open('Assignment declined', 'Close', { duration: 3000 });
          this.loadMyAssignments();
          this.loadEvents();
        },
        error: (err) => this.showError('Failed to decline assignment')
      });
  }

  generateReport(): void {
    this.isLoadingReport = true;
    this.reportService.getReportSummary()
      .pipe(finalize(() => this.isLoadingReport = false))
      .subscribe({
        next: (summary) => {
          this.reportSummary = summary;
          this.updateStatsFromSummary(summary);
          this.snackBar.open('Report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => this.showError('Failed to generate report')
      });
  }

  exportData(): void {
    this.reportService.exportReportSummary();
    this.snackBar.open('Exporting report...', 'Close', { duration: 3000 });
  }

  navigateToUpcomingEvent(event: Event): void {
    this.router.navigate(['/events', event.id]);
  }

  onRowClick(event: TableEvent): void {
    this.router.navigate(['/events', event.id]);
  }

  viewEvent(event: any): void {
    const id = event.id || event.eventId;
    this.router.navigate(['/events', id]);
  }

  editEvent(event: TableEvent): void {
    if (this.canManageEvent(event)) {
      this.router.navigate(['/events/edit', event.id]);
    } else {
      this.showError('You do not have permission to edit this event');
    }
  }

  submitEvent(event: TableEvent): void {
    this.eventService.submitEvent(event.id).subscribe({
      next: () => {
        this.snackBar.open('Event submitted for approval', 'Close', { duration: 3000 });
        this.loadEvents();
      },
      error: () => this.showError('Failed to submit event')
    });
  }

  deleteEvent(event: TableEvent): void {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      this.eventService.deleteEvent(event.id)
        .subscribe({
          next: () => {
            this.snackBar.open(`🗑️ Deleted: ${event.name}`, 'Close', { duration: 3000 });
            this.loadEvents();
          },
          error: () => this.showError('Failed to delete event')
        });
    }
  }

  // ========= NAVIGATION ==========

  navigateToCreateEvent(): void {
    this.router.navigate(['/events/create']);
  }

  navigateToCreateAnnouncement(): void {
    this.router.navigate(['/internal-announcements'], { queryParams: { create: 'true' } });
  }

  navigateToAnnouncements(): void {
    this.router.navigate(['/internal-announcements']);
  }

  isStaff(): boolean {
    return this.authService.isStaff();
  }

  // ==================== UTILITY METHODS ====================

  get roleDisplay(): string {
    return this.user?.roles?.[0] || 'User';
  }

  get departmentName(): string {
    if (!this.user?.departmentId) return 'Unknown';
    return this.departmentMap[this.user.departmentId] || 'Unknown Department';
  }

  getFullName(user: { firstName: string; lastName: string }): string {
    return `${user.firstName} ${user.lastName}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
      case 'Ongoing':
      case 'Completed':
        return 'published';
      case 'Draft':
        return 'draft';
      case 'Submitted':
        return 'pending';
      case 'Archived':
        return 'archived';
      case 'Cancelled':
      case 'Rejected':
        return 'rejected';
      default:
        return status.toLowerCase();
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isManager(): boolean {
    return this.authService.isManager();
  }

  canApproveEvents(): boolean {
    return this.authService.canApproveEvents();
  }

  canManageEvent(event: TableEvent): boolean {
    if (this.authService.isAdmin()) return true;
    if (event.status !== 'Draft') return false;
    return event.raw.createdBy.id === this.user?.adObjectId;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}