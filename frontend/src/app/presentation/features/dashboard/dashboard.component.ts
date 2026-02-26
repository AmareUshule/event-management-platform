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

// Services
import { AuthService } from '../../../core/auth/auth.service';
import { EventService } from '../events/services/event.service';

// Models
import { Event, EventFormData, EventStatus } from '../events/models/event.model';
import { AuthUser } from '../../../core/models/auth-user.model';

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
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ==================== MASTER DATA (NEVER MODIFIED) ====================
  private masterEvents: Event[] = [];           // Raw events from API - NEVER TOUCH
  private masterTableEvents: TableEvent[] = []; // Transformed events - NEVER MODIFY

  // ==================== FILTERED DATA (FOR DISPLAY) ====================
  filteredEvents: TableEvent[] = [];             // What table displays - MODIFIED BY FILTERS ONLY

  // ==================== UI STATE ====================
  user: AuthUser | null = null;
  isLoading = true;
  isLoadingEvents = true;
  currentDate = new Date();
  selectedTabIndex = 0;
  searchTerm: string = '';

  // ==================== TABLE CONFIGURATION ====================
  displayedColumns: string[] = ['id', 'eventName', 'location', 'date', 'actions'];

  // ==================== STATISTICS ====================
  totalEvents = 0;
  publishedEvents = 0;
  draftEvents = 0;
  todaysEvents = 0;
  pendingApprovals = 0;

  // ==================== INSIGHTS ====================
  upcomingEventsCount = 0;
  pendingApprovalsCount = 0;

  // ==================== AGENDA ====================
  agendaItems: AgendaItem[] = [];

  // ==================== CLEANUP ====================
  private destroy$ = new Subject<void>();

  // ==================== DEPENDENCY INJECTION ====================
  private authService = inject(AuthService);
  private eventService = inject(EventService);
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
          console.log('Master events loaded:', events.length);
          this.setMasterData(events);
        }
      });
  }

  /**
   * CRITICAL: This is the ONLY place where master data is set
   * Never modify masterEvents or masterTableEvents after this
   */
  private setMasterData(events: Event[]): void {
    // Set master raw events
    this.masterEvents = events;

    // Transform and set master table events
    this.masterTableEvents = this.transformToTableEvents(events);

    // Calculate statistics from master data
    this.calculateStatistics();

    // Update insights from master data
    this.updateInsights();

    // Apply current filters to populate filteredEvents
    this.applyFilters();
  }

  /**
   * Pure function: transforms events to table format without side effects
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

  /**
   * Calculate statistics from master data
   */
  private calculateStatistics(): void {
    this.totalEvents = this.masterEvents.length;
    this.publishedEvents = this.masterEvents.filter(e =>
      e.status === 'Approved' || e.status === 'Completed'
    ).length;
    this.draftEvents = this.masterEvents.filter(e => e.status === 'Draft').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.todaysEvents = this.masterEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;
  }

  /**
   * Update insights from master data
   */
  private updateInsights(): void {
    this.pendingApprovals = this.masterEvents.filter(e => e.status === 'Pending').length;

    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    this.upcomingEventsCount = this.masterEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate >= now && eventDate <= weekFromNow;
    }).length;

    this.pendingApprovalsCount = this.pendingApprovals;
    this.updateAgendaWithEvents();
  }

  private updateAgendaWithEvents(): void {
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
  // ALL filter methods MUST filter from masterTableEvents and set filteredEvents

  applySearch(event: any): void {
    const filterValue = event.target.value.toLowerCase().trim();
    this.searchTerm = filterValue;
    this.applyFilters();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.applyFilters();
  }

  // ==================== ACTIONS ====================
// After any action that modifies data, reload from API
// dashboard.component.ts
onRowClick(event: TableEvent): void {
  // Make sure we're passing the complete event object
  console.log('Navigating to event:', event.id, event);
  this.router.navigate(['/events', event.id], { 
    state: { event: event.raw || event } // Pass the raw event data if available
  });
}

  /**
   * CRITICAL: Always filter from masterTableEvents
   * Never filter from filteredEvents
   */
  private applyFilters(): void {
    // Start with master copy (never modified)
    let filtered = [...this.masterTableEvents];

    console.log('📊 Filtering - Tab:', this.selectedTabIndex, 'Search:', this.searchTerm);
    console.log('📊 Master count:', this.masterTableEvents.length);

    // Apply tab filter
    switch (this.selectedTabIndex) {
      case 1: // Published
        filtered = filtered.filter(e =>
          e.status === 'Approved' || e.status === 'Completed'
        );
        break;
      case 2: // Draft
        filtered = filtered.filter(e => e.status === 'Draft');
        break;
      // case 0: ALL - no filter needed
    }

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(this.searchTerm) ||
        event.location.toLowerCase().includes(this.searchTerm) ||
        event.departmentName.toLowerCase().includes(this.searchTerm) ||
        event.createdByName.toLowerCase().includes(this.searchTerm)
      );
    }

    console.log('📊 Filtered count:', filtered.length);

    // Update the display data source
    this.filteredEvents = filtered;
    this.cdr.detectChanges();
  }

  filterByDate(range: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter from master, never from filtered
    const filtered = this.masterTableEvents.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });

    this.filteredEvents = filtered;
    this.cdr.detectChanges();

    this.snackBar.open(`Found ${filtered.length} event(s) for today`, 'Close', {
      duration: 3000
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters(); // This will reset to tab-filtered view
  }

  resetFilters(): void {
    this.selectedTabIndex = 0;
    this.searchTerm = '';
    this.filteredEvents = [...this.masterTableEvents]; // Reset to all events
    this.cdr.detectChanges();
  }

  // ==================== ACTIONS ====================
  // After any action that modifies data, reload from API

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

  publishEvent(event: TableEvent): void {
    if (event.status === 'Draft') {
      const formData: Partial<EventFormData> = {
        title: event.raw.title,
        description: event.raw.description
      };

      this.eventService.updateEvent(event.id, formData, EventStatus.PENDING)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(`Event submitted for approval: ${event.name}`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadEvents(); // Reload to get updated data
          },
          error: () => this.showError('Failed to publish event')
        });
    }
  }

  deleteEvent(event: TableEvent): void {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      this.eventService.deleteEvent(event.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(`Deleted: ${event.name}`, 'Close', { duration: 3000 });
            this.loadEvents(); // Reload to refresh list
          },
          error: () => this.showError('Failed to delete event')
        });
    }
  }

  // ==================== NAVIGATION ====================

  navigateToCreateEvent(): void {
    if (this.authService.canCreateEvents()) {
      this.router.navigate(['/events/create']);
    } else {
      this.showError('You do not have permission to create events');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ====== UTILITY METHODS ========

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
  // ===== ERROR HANDLING ====

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}