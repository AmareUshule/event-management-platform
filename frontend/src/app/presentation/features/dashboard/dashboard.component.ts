// src/app/presentation/features/dashboard/dashboard.component.ts

import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Event, EventFormData, EventStatus } from '../events/models/event.model';
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
  reportSummary: ReportSummary | null = null;   // Report summary from API
  latestAnnouncements: Announcement[] = [];     // Latest announcements (preview)
  isLoadingAnnouncements = false;

  // ==================== FILTERED DATA (FOR DISPLAY - MODIFIED BY FILTERS ONLY) ====================
  filteredEvents: TableEvent[] = [];             // All filtered events - UPDATED ONLY VIA applyFilters()
  paginatedEvents: TableEvent[] = [];            // Current page of events for display

  // ====== PAGINATION STATE =========
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  // ===== UI STATE =======
  user: AuthUser | null = null;
  isLoading = true;
  isLoadingEvents = true;
  isLoadingReport = false;
  currentDate = new Date();
  selectedTabIndex = 0;
  searchTerm: string = '';
  isMobileMenuOpen = false;

  // ======== TABLE CONFIGURATION ============
  displayedColumns: string[] = ['id', 'eventName', 'location', 'date', 'actions'];

  // =========== STATISTICS (DERIVED FROM MASTER DATA) =============
  totalEvents = 0;
  scheduledEvents = 0;
  draftEvents = 0;
  eventsThisWeek = 0;
  pendingApprovals = 0;

  // ============ INSIGHTS (DERIVED FROM MASTER DATA) ============
  upcomingEventsCount = 0;
  pendingApprovalsCount = 0;

  // ============ AGENDA (DERIVED FROM MASTER DATA) ============
  agendaItems: AgendaItem[] = [];

  // =========== CLEANUP =============
  private destroy$ = new Subject<void>();

  // ========== DEPENDENCY INJECTION ==========
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private reportService = inject(ReportService);
  private announcementService = inject(AnnouncementService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

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
    this.initializeComponent();
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
    if (this.authService.isAdmin() || this.authService.isManager()) {
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

    const filters = this.buildFilters();

    this.eventService.getAllEvents(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingEvents = false;
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (events) => {
          console.log('📥 Master events loaded:', events.length);
          this.setMasterData(events);
        },
        error: (error) => {
          console.error('Failed to load events:', error);
          this.showError('Failed to load events');
        }
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
    this.scheduledEvents = summary.scheduledCount;
    this.draftEvents = summary.draftCount;
    this.pendingApprovalsCount = summary.pendingApprovalsCount;
  }

  private setMasterData(events: Event[]): void {
    // 1. Set master raw events (never modify after this)
    this.masterEvents = events;

    // 2. Transform and set master table events (never modify after this)
    this.masterTableEvents = this.transformToTableEvents(events);

    // 3. Calculate all derived data from master
    if (!this.reportSummary) {
      this.calculateStatistics();
      this.updateInsights();
    }
    this.updateEventsThisWeek();
    this.updateAgendaFromMaster();

    // 4. Apply current filters to populate filteredEvents and paginatedEvents for display
    this.applyFilters();

    console.log('📊 Master data updated:', {
      total: this.masterEvents.length,
      filtered: this.filteredEvents.length,
      paginated: this.paginatedEvents.length,
      stats: { total: this.totalEvents, scheduled: this.scheduledEvents, draft: this.draftEvents }
    });
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
      status: event.status,
      departmentName: event.department?.name || 'Unknown',
      createdByName: this.getFullName(event.createdBy),
      raw: event
    }));
  }

  private buildFilters(): { departmentId?: string; status?: string } {
    const filters: { departmentId?: string; status?: string } = {};

    if (!this.authService.isAdmin()) {
      const deptGuid = this.authService.getDepartmentGuid();
      if (deptGuid) {
        filters.departmentId = deptGuid;
      }
    }

    return filters;
  }

  // ==================== DERIVED DATA CALCULATIONS ====================
  // All methods here read from master data and update display properties

  /**
   * Calculate statistics from master data
   */
  private calculateStatistics(): void {
    this.totalEvents = this.masterEvents.length;
    this.scheduledEvents = this.masterEvents.filter(e =>
      e.status === 'Scheduled' ).length;
    this.draftEvents = this.masterEvents.filter(e => e.status === 'Draft').length;
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
    this.pendingApprovals = this.masterEvents.filter(e => e.status === 'Pending').length;

    if (this.upcomingEvents.length === 0) {
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      this.upcomingEventsCount = this.masterEvents.filter(e => {
        const eventDate = new Date(e.startDate);
        return eventDate >= now && eventDate <= weekFromNow;
      }).length;
    }

    this.pendingApprovalsCount = this.pendingApprovals;
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

  // ==================== FILTERING ====================
  // CRITICAL: All filter methods MUST:
  // 1. Start from masterTableEvents (never from filteredEvents)
  // 2. Apply all active filters
  // 3. Update filteredEvents
  // 4. Reset pagination and update paginatedEvents

  /**
   * Apply search filter - triggered from input
   */
  applySearch(event: any): void {
    const filterValue = event.target.value.toLowerCase().trim();
    this.searchTerm = filterValue;
    this.applyFilters();
  }

  /**
   * Handle tab change - updates tab filter
   */
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.applyFilters();
  }

  /**
   * CORE FILTERING METHOD: Applies all active filters to master data
   * This is the ONLY place that should update filteredEvents
   */
  private applyFilters(): void {
    // CRITICAL: Always start with a fresh copy of master data
    let filtered = [...this.masterTableEvents];

    console.log('🔍 Applying filters - Tab:', this.selectedTabIndex, 'Search:', this.searchTerm);
    console.log('📊 Master count:', this.masterTableEvents.length);

    // Apply tab filter
    switch (this.selectedTabIndex) {
      case 1: // Published
        filtered = filtered.filter(e =>
          e.status === 'Scheduled'
        );
        break;
      case 2: // Draft
        filtered = filtered.filter(e => e.status === 'Draft');
        break;
      case 3: // Pending
        filtered = filtered.filter(e => e.status === 'Pending');
        break;
      // case 0: ALL - no filter needed
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

    console.log('📊 Filtered count:', filtered.length);

    // Update filtered data
    this.filteredEvents = filtered;
    
    // Reset to first page and update paginated events
    this.currentPage = 0;
    this.updatePaginatedEvents();
    
    this.cdr.detectChanges();
  }

  // ==================== PAGINATION METHODS ====================

  /**
   * Update paginated events based on current page and page size
   */
  private updatePaginatedEvents(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredEvents.length / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
    
    // Calculate slice indices
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredEvents.length);
    
    // Get current page events
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
    
    console.log(`📄 Page ${this.currentPage + 1} of ${this.totalPages}:`, {
      total: this.filteredEvents.length,
      startIndex,
      endIndex,
      events: this.paginatedEvents.map(e => e.name)
    });
    
    this.cdr.detectChanges();
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginatedEvents();
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedEvents();
    }
  }

  /**
   * Go to first page
   */
  goToFirstPage(): void {
    this.currentPage = 0;
    this.updatePaginatedEvents();
  }

  /**
   * Go to last page
   */
  goToLastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.updatePaginatedEvents();
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(event: any): void {
    const newSize = parseInt(event.target.value, 10);
    if (this.pageSize !== newSize) {
      this.pageSize = newSize;
      this.currentPage = 0; // Reset to first page when page size changes
      this.updatePaginatedEvents();
      
      console.log(`📏 Page size changed to: ${newSize}`);
    }
  }

  /**
   * Get the end index of current page (for display)
   */
  getCurrentPageEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredEvents.length);
  }

  /**
   * Special filter by date range - can be called from UI
   */
  filterByDate(range: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // CRITICAL: Filter from master, never from filtered
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

  /**
   * Clear search and reset to tab-filtered view
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters(); // This will reset to tab-filtered view
  }

  /**
   * Reset all filters to show all events
   */
  resetFilters(): void {
    this.selectedTabIndex = 0;
    this.searchTerm = '';
    this.filteredEvents = [...this.masterTableEvents];
    this.currentPage = 0;
    this.updatePaginatedEvents();
    
    this.cdr.detectChanges();
    
    console.log('🔄 Filters reset, showing all events:', this.masterTableEvents.length);
  }

  // ==================== ACTIONS ====================
  // All actions that modify data MUST reload from API to refresh master data

  generateReport(): void {
    this.isLoadingReport = true;
    this.reportService.getReportSummary()
      .pipe(
        finalize(() => this.isLoadingReport = false)
      )
      .subscribe({
        next: (summary) => {
          this.reportSummary = summary;
          this.updateStatsFromSummary(summary);
          this.snackBar.open('Report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.showError('Failed to generate report');
        }
      });
  }

  exportData(): void {
    this.reportService.exportReportSummary();
    this.snackBar.open('Exporting report...', 'Close', { duration: 3000 });
  }

  onRowClick(event: TableEvent): void {
    console.log('Navigating to event:', event.id, event);
    this.router.navigate(['/events', event.id], {
      state: { event: event.raw || event }
    });
  }

  viewEvent(event: TableEvent): void {
    this.router.navigate(['/events', event.id]);
  }

  editEvent(event: TableEvent): void {
    const canEdit = this.authService.isAdmin() ||
      (this.authService.isManager() &&
        this.authService.getDepartmentGuid() === event.raw.department?.id);

    if (canEdit) {
      this.router.navigate(['/events/edit', event.id]);
    } else {
      this.showError('You do not have permission to edit this event');
    }
  }

  /**
   * Publish event - after success, reload data to refresh master
   */
  publishEvent(event: TableEvent): void {
    if (event.status === 'Draft') {
      const formData: Partial<EventFormData> = {
        title: event.raw.title,
        description: event.raw.description
      };

      this.eventService.updateEvent(event.id, formData, EventStatus.DRAFT)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(`✅ Event submitted for approval: ${event.name}`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            // CRITICAL: Reload to refresh master data
            this.loadEvents();
          },
          error: () => this.showError('Failed to publish event')
        });
    }
  }

  /**
   * Delete event - after success, reload data to refresh master
   */
  deleteEvent(event: TableEvent): void {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      this.eventService.deleteEvent(event.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(`🗑️ Deleted: ${event.name}`, 'Close', { duration: 3000 });
            // CRITICAL: Reload to refresh master data
            this.loadEvents();
          },
          error: () => this.showError('Failed to delete event')
        });
    }
  }

  // ========= NAVIGATION ==========

  navigateToCreateEvent(): void {
    if (this.authService.canCreateEvents()) {
      this.router.navigate(['/events/create']);
    } else {
      this.showError('You do not have permission to create events');
    }
  }

  navigateToCreateAnnouncement(): void {
    if (this.authService.isAdmin() || this.authService.isManager() || this.authService.isCommunicationManager()) {
      this.router.navigate(['/internal-announcements'], { queryParams: { create: 'true' } });
    } else {
      this.showError('You do not have permission to create announcements');
    }
  }

  navigateToAnnouncements(): void {
    this.router.navigate(['/internal-announcements']);
  }
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
      case 'Approved':
      case 'Completed':
        return 'published';
      case 'Draft':
        return 'draft';
      case 'Pending':
        return 'pending';
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

  // ==================== ERROR HANDLING ====================

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}