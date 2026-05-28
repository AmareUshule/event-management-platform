// src/app/presentation/features/dashboard/dashboard.component.ts

import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, interval, Subscription } from 'rxjs';

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
import { Event, EventFormData, EventStatus, Assignment, AssignmentResponse } from '../events/models/event.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { Announcement } from '../internal-announcements/models/announcement.model';

// Carousel interface
interface CarouselImage {
  src: string;
  alt: string;
  title: string;
}

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
  activePastFilter: string = 'all'; // Nested filter for Past Events
  searchTerm: string = '';
  isMobileMenuOpen = false;
  heroActionSelected = '';

  // ===== CAROUSEL STATE =======
  currentSlideIndex = 0;
  private carouselSubscription?: Subscription;
  
  carouselImages: CarouselImage[] = [
    {
      src: 'assets/images/substation.png',
      alt: 'Electrical Substation',
      title: 'Substations'
    },
    {
      src: 'assets/images/transmission-tower.jpg',
      alt: 'Transmission Line Tower',
      title: 'Transmission Towers'
    },
    {
      src: 'assets/images/dam.jpg',
      alt: 'Grand Ethiopian Renaissance Dam',
      title: 'Grand Ethiopian Renaissance Dam'
    },
    {
      src: 'assets/images/asella.png',
      alt: 'Assela Wind Power Plant',
      title: 'Assela Wind Power Plant'
    },
    {
      src: 'assets/images/Ayisha.png',
      alt: 'Ayisha Wind Power Plant',
      title: 'Ayisha Wind Power Plant'
    }
  ];

  // ======== TABLE CONFIGURATION ============
  displayedColumns: string[] = ['id', 'eventName', 'location', 'date', 'actions'];
  assignmentColumns: string[] = ['id', 'eventTitle', 'date', 'role', 'status', 'actions'];

  // =========== STATISTICS (DERIVED FROM MASTER DATA) =============
  totalEvents = 0;
  scheduledEvents = 0;
  pendingApprovalCount = 0; // Renamed from draftEventsCount
  ongoingEvents = 0;
  pastEventsCount = 0;
  completedEventsCount = 0;
  coveredEvents = 0;
  uncoveredEvents = 0;
  cancelledEventsCount = 0;
  eventsThisWeek = 0;
  assignedEventsCount = 0;
  pendingAssignmentsCount = 0;

  // ============ INSIGHTS (DERIVED FROM MASTER DATA) ============
  upcomingEventsCount = 0;
  pendingApprovalsCount = 0;

  // ============ AGENDA (DERIVED FROM MASTER DATA) ============
  agendaItems: AgendaItem[] = [];

  // ============ STAFF SPECIFIC (Expert/Cameraman) ============
  nextAssignment: TableEvent | null = null;
  pendingInvitations: AssignmentResponse[] = [];
  pendingUploads: TableEvent[] = [];

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
      this.startCarousel();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.carouselSubscription) {
      this.carouselSubscription.unsubscribe();
    }
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

  // ==================== CAROUSEL METHODS ====================

  startCarousel(): void {
    this.carouselSubscription = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.carouselImages.length;
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  // ==================== HERO / ROLE SUMMARY ====================

  get heroGreeting(): string {
    const hour = new Date().getHours();
    const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    const name = this.user?.fullName?.split(' ')[0] || 'Team';
    return `Good ${period}, ${name}`;
  }

  get heroRoleLabel(): string {
    if (this.authService.isAdmin()) return 'Administrator';
    if (this.authService.isCommunicationManager()) return 'Communication Manager';
    if (this.authService.isManager()) return 'Department Manager';
    if (this.authService.isStaff()) return 'Assigned Staff';
    return 'Employee';
  }

  get heroAlertTitle(): string {
    if (this.canApproveEvents() && this.pendingApprovalCount > 0) {
      return 'Approval queue';
    }

    if (this.isStaff() && this.pendingAssignmentsCount > 0) {
      return 'Pending invitations';
    }

    if (this.ongoingEvents > 0) {
      return 'Live events in progress';
    }

    if (this.upcomingEventsCount > 0) {
      return 'Upcoming events this week';
    }

    return 'Operational status';
  }

  get heroAlertText(): string {
    if (this.isManagerView() && this.managerActionQueueCount > 0) {
      return `${this.pendingVerificationCount} event${this.pendingVerificationCount === 1 ? '' : 's'} with submitted staff coverage need verification.`;
    }

    if (this.canApproveEvents() && this.pendingApprovalCount > 0) {
      return `You have ${this.pendingApprovalCount} draft event${this.pendingApprovalCount === 1 ? '' : 's'} requiring review.`;
    }

    if (this.isStaff() && this.pendingAssignmentsCount > 0) {
      return `You have ${this.pendingAssignmentsCount} pending invitation${this.pendingAssignmentsCount === 1 ? '' : 's'} waiting response.`;
    }

    if (this.ongoingEvents > 0) {
      return `There are ${this.ongoingEvents} active event${this.ongoingEvents === 1 ? '' : 's'} right now.`;
    }

    if (this.upcomingEventsCount > 0) {
      return `You have ${this.upcomingEventsCount} events scheduled in the next 7 days.`;
    }

    return 'All systems are nominal. No urgent action items detected.';
  }

  get heroMetrics(): Array<{ label: string; value: number; description: string;}> {
    if (this.authService.isAdmin() || this.authService.isManager() || this.authService.isCommunicationManager()) {
      return [
        { label: this.isStaff() ? 'My Assignments' : 'Total Events', value: this.isStaff() ? this.assignedEventsCount : this.totalEvents, description: this.isStaff() ? 'Assigned to you' : 'Visible events' },
        { label: 'Action Needed', value: this.isStaff() ? this.pendingAssignmentsCount : this.pendingApprovalCount, description: 'Items needing review' },
        { label: 'Live events', value: this.ongoingEvents, description: 'Currently active' },
        { label: 'In 7 days', value: this.upcomingEventsCount, description: 'Upcoming schedule' }
      ];
    }

    if (this.isStaff()) {
      return [
        { label: 'My assignments', value: this.assignedEventsCount, description: 'Total assigned events' },
        { label: 'Pending invites', value: this.pendingAssignmentsCount, description: 'Awaiting your response' },
        { label: 'Live events', value: this.ongoingEvents, description: 'In progress' },
        { label: 'Upcoming', value: this.upcomingEventsCount, description: 'Next 7 days' }
      ];
    }

    return [
      { label: 'Ongoing events', value: this.ongoingEvents, description: 'Active now' },
      { label: 'Upcoming', value: this.upcomingEventsCount, description: 'Within 7 days' },
      { label: 'Past events', value: this.pastEventsCount, description: 'Completed or archived' },
      { label: 'Announcements', value: this.latestAnnouncements.length, description: 'Recent updates' }
    ];
  }

  get heroActionButtons(): Array<{ label: string; icon: string; visible: boolean; click: () => void; description: string }> {
    return [
      {
        label: 'Create Event',
        icon: 'add',
        visible: this.authService.canCreateEvents(),
        click: () => this.navigateToCreateEvent(),
        description: 'Start a new event workflow'
      },
      {
        label: 'Review Approvals',
        icon: 'edit_note',
        visible: this.canApproveEvents(),
        click: () => this.onStatCardClick('draft'),
        description: 'Open drafts awaiting review'
      },
      {
        label: this.authService.isCommunicationManager() ? 'Archive Pending' : 'Verify Coverage',
        icon: 'rate_review',
        visible: this.isManagerView(),
        click: () => this.onStatCardClick('verification'),
        description: 'Open submitted staff coverage'
      },
      {
        label: 'My Assignments',
        icon: 'assignment',
        visible: this.isStaff(),
        click: () => this.onStatCardClick('assignments'),
        description: 'View pending events and invites'
      },
      {
        label: 'Export Report',
        icon: 'download',
        visible: this.authService.isAdmin() || this.authService.isManager(),
        click: () => this.exportData(),
        description: 'Download current event summary'
      }
    ];
  }

  get heroSubText(): string {
    if (this.isManagerView() && this.managerActionQueueCount > 0) {
      if (this.authService.isCommunicationManager()) {
        return 'Archive completed events after manager coverage approval is in place.';
      }

      return 'Review submitted staff coverage while the work is still fresh.';
    }

    if (this.canApproveEvents() && this.pendingApprovalCount > 0) {
      return 'Approve drafts quickly to keep the event pipeline moving.';
    }
    if (this.isStaff() && this.pendingAssignmentsCount > 0) {
      return 'Respond to assignment invitations to keep your schedule clear.';
    }
    if (this.ongoingEvents > 0) {
      return 'Monitor live operations and verify current event progress.';
    }
    return 'Use this dashboard to manage your event workflow with confidence.';
  }

  get verificationQueue(): Event[] {
    return this.masterEvents
      .filter(event => this.requiresVerification(event))
      .sort((a, b) => new Date(b.updatedAt || b.endDate || b.startDate).getTime() - new Date(a.updatedAt || a.endDate || a.startDate).getTime());
  }

  get finalizationQueue(): Event[] {
    return this.masterEvents
      .filter(event => this.requiresFinalization(event))
      .sort((a, b) => new Date(b.updatedAt || b.endDate || b.startDate).getTime() - new Date(a.updatedAt || a.endDate || a.startDate).getTime());
  }

  get managerActionQueue(): Event[] {
    return this.authService.isCommunicationManager() ? this.finalizationQueue : this.verificationQueue;
  }

  get pendingVerificationCount(): number {
    return this.verificationQueue.length;
  }

  get pendingFinalizationCount(): number {
    return this.finalizationQueue.length;
  }

  get managerActionQueueCount(): number {
    return this.authService.isCommunicationManager() ? this.pendingFinalizationCount : this.pendingVerificationCount;
  }

  get pastAwaitingVerificationCount(): number {
    return this.completedEventsCount;
  }

  get verificationQueueLabel(): string {
    return this.authService.isCommunicationManager() ? 'Ready for Finalization' : 'Pending Verification';
  }

  get verificationQueueHeader(): string {
    return this.authService.isCommunicationManager() ? 'Finalization Queue' : 'Verification Queue';
  }

  get managerActionQueueDescription(): string {
    return this.authService.isCommunicationManager() ? 'Ready to close' : 'Submitted coverage';
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
      this.completedEventsCount = summary.completedCount;
      this.coveredEvents = summary.coveredCount;
      this.uncoveredEvents = summary.uncoveredCount;
      this.pastEventsCount = summary.completedCount + summary.coveredCount + summary.uncoveredCount + summary.cancelledCount;
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
    
    // Drafts (Pending Approval) visibility is now handled by the backend.
    // So all Draft events in masterEvents are visible to the current user.
    this.pendingApprovalCount = this.masterEvents.filter(e => e.status === "Draft").length;
      
    this.scheduledEvents = this.masterEvents.filter(e => e.status === "Scheduled").length;
    this.ongoingEvents = this.masterEvents.filter(e => e.status === "Ongoing").length;
    this.completedEventsCount = this.masterEvents.filter(e => e.status === "Completed").length;
    this.coveredEvents = this.masterEvents.filter(e => e.status === "Covered").length;
    this.uncoveredEvents = this.masterEvents.filter(e => e.status === "Uncovered").length;
    
    // Merged Past Events (Completed + Covered + Uncovered + Cancelled)
    this.pastEventsCount = this.masterEvents.filter(e => 
      ['Completed', 'Covered', 'Uncovered', 'Cancelled'].includes(e.status)).length;

    this.cancelledEventsCount = this.masterEvents.filter(e => e.status === "Cancelled").length;

    if (this.isStaff()) {
      // For staff, we distinguish between 'Assignments' (Roles) and 'Events' (Work items)
      // Unique event IDs that this staff member is involved in
      const assignedEventIds = new Set(this.myAssignments.map(a => a.eventId));
      
      // The events that are actually loaded and visible to the staff member
      const myVisibleEvents = this.masterEvents.filter(e => assignedEventIds.has(e.id));
      
      // 'totalEvents' should represent the count of unique events visible in the 'ALL' tab
      this.totalEvents = myVisibleEvents.length;
      
      // 'assignedEventsCount' (Summary Card) now matches 'totalEvents' to ensure consistency
      // between the top statistics and the table tabs.
      this.assignedEventsCount = this.totalEvents;
      
      // Categories derived strictly from visible assigned events
      this.scheduledEvents = myVisibleEvents.filter(e => e.status === "Scheduled").length;
      this.ongoingEvents = myVisibleEvents.filter(e => e.status === "Ongoing").length;
      this.coveredEvents = myVisibleEvents.filter(e => e.status === "Covered").length;
      this.uncoveredEvents = myVisibleEvents.filter(e => e.status === "Uncovered").length;
      this.pastEventsCount = myVisibleEvents.filter(e => ['Completed', 'Covered', 'Uncovered', 'Cancelled'].includes(e.status)).length;
      this.cancelledEventsCount = myVisibleEvents.filter(e => e.status === "Cancelled").length;

      // Specific assignment counts (for the Inbox/Staff Center)
      this.pendingInvitations = this.myAssignments.filter(a => a.status === "Pending");
      this.pendingAssignmentsCount = this.pendingInvitations.length;
      
      // Identify Next Assignment (Confirmed and in future)
      const now = new Date();
      const confirmedAssignments = this.myAssignments
        .filter(a => a.status === "Accepted")
        .map(a => {
          const ev = this.masterEvents.find(e => e.id === a.eventId);
          return ev ? { event: ev, date: new Date(ev.startDate) } : null;
        })
        .filter(item => item !== null && item.date >= now)
        .sort((a, b) => a!.date.getTime() - b!.date.getTime());

      if (confirmedAssignments.length > 0) {
        const next = confirmedAssignments[0]!.event;
        this.nextAssignment = this.transformToTableEvents([next])[0];
      } else {
        this.nextAssignment = null;
      }

      // Identify Pending Uploads (Completed events with no media from this user)
      this.pendingUploads = this.masterEvents
        .filter(e => e.status === "Completed" && assignedEventIds.has(e.id))
        .filter(e => {
          const userAssignment = this.myAssignments.find(a => a.eventId === e.id);
          return userAssignment?.status === "Accepted";
        })
        .map(e => this.transformToTableEvents([e])[0]);
    }
    
    this.updateEventsThisWeek();
  }

  getUserRoleInEvent(eventId: string): string {
    const assignment = this.myAssignments.find(a => a.eventId === eventId);
    return assignment?.role || 'Staff';
  }

  getAssignmentStatus(eventId: string): string {
    const assignment = this.myAssignments.find(a => a.eventId === eventId);
    return assignment?.status || 'Pending';
  }

  getEventDateForAssignment(eventId: string): Date | null {
    const event = this.masterEvents.find(e => e.id === eventId);
    return event ? new Date(event.startDate) : null;
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
      const isActive = e.status === "Scheduled" || e.status === "Ongoing";
      return isActive && eventDate >= startOfWeek && eventDate < endOfWeek;
    }).length;
  }

  /**
   * Update insights from master data
   */
  private updateInsights(): void {
    if (this.isStaff()) {
      const assignedEventIds = new Set(this.myAssignments.map(a => a.eventId));
      const myVisibleEvents = this.masterEvents.filter(e => assignedEventIds.has(e.id));
      
      this.pendingApprovalsCount = 0; // Staff don't approve events

      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      this.upcomingEventsCount = myVisibleEvents.filter(e => {
        const eventDate = new Date(e.startDate);
        return e.status === "Scheduled" && eventDate >= now && eventDate <= weekFromNow;
      }).length;
      return;
    }

    this.pendingApprovalsCount = this.masterEvents.filter(e => e.status === "Draft").length;

    // Use only Scheduled events for the upcoming count
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    this.upcomingEventsCount = this.masterEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      return e.status === "Scheduled" && eventDate >= now && eventDate <= weekFromNow;
    }).length;
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
    if (tab === 'covered' || tab === 'uncovered' || tab === 'past') {
      this.activeTab = 'past';
      this.activePastFilter = tab === 'past' ? 'all' : tab;
    } else {
      this.onTabChange(tab);
    }
    this.applyFilters();
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
    this.activePastFilter = 'all'; // Reset sub-filter when changing main tab
    this.applyFilters();
  }

  onPastFilterChange(filter: string): void {
    this.activePastFilter = filter;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.masterTableEvents];

    // For Staff roles, the main table should be scoped to their work to match the status card counts
    if (this.isStaff()) {
      const assignedEventIds = new Set(this.myAssignments.map(a => a.eventId));
      filtered = filtered.filter(e => assignedEventIds.has(e.id));
    }

    if (this.activeTab === 'assignments') {
       this.filteredEvents = [];
       this.paginatedEvents = [];
       this.cdr.detectChanges();
       return;
    }

    switch (this.activeTab) {
      case 'draft': 
        filtered = filtered.filter(e => e.status === 'Draft');
        break;
      case 'scheduled':
        filtered = filtered.filter(e => e.status === 'Scheduled');
        break;
      case 'ongoing':
        filtered = filtered.filter(e => e.status === 'Ongoing');
        break;
      case 'past':
        // Base filter for past events
        filtered = filtered.filter(e => ['Completed', 'Covered', 'Uncovered', 'Cancelled'].includes(e.status));
        
        // Apply nested sub-filters
        if (this.activePastFilter === 'covered') {
          filtered = filtered.filter(e => e.status === 'Covered');
        } else if (this.activePastFilter === 'uncovered') {
          filtered = filtered.filter(e => e.status === 'Uncovered');
        } else if (this.activePastFilter === 'cancelled') {
          filtered = filtered.filter(e => e.status === 'Cancelled');
        } else if (this.activePastFilter === 'awaiting') {
          filtered = filtered.filter(e => e.status === 'Completed');
        }
        break;
      case 'verification':
        filtered = filtered.filter(e => this.authService.isCommunicationManager() ? this.requiresFinalization(e.raw) : this.requiresVerification(e.raw));
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

  quickReview(event: Event): void {
    if (!event.id) return;
    this.router.navigate(['/events', event.id], { queryParams: { tab: 'staff' } });
  }

  editEvent(event: TableEvent): void {
    if (this.canEditEvent(event)) {
      this.router.navigate(['/events/edit', event.id]);
    } else {
      this.showError('You cannot edit completed or archived events');
    }
  }

  deleteEvent(event: TableEvent): void {
    if (!this.canDeleteEvent(event)) {
      this.showError('You do not have permission to delete this event');
      return;
    }

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
      case 'Covered':
        return 'published';
      case 'Draft':
        return 'draft';
      case 'Archived':
        return 'archived';
      case 'Cancelled':
      case 'Rejected':
      case 'Uncovered':
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

  isManagerView(): boolean {
    return this.authService.isAdmin() || this.authService.isManager();
  }

  canApproveEvents(): boolean {
    return this.authService.canApproveEvents();
  }

  canManageEvent(event: TableEvent): boolean {
    // Check if user can manage (edit/delete) this event
    return this.canEditEvent(event) || this.canDeleteEvent(event);
  }

  canEditEvent(event: TableEvent): boolean {
    // Edit is only allowed for non-final events
    const isFinalStatus = 
      event.status === 'Completed' || 
      event.status === 'Archived' || 
      event.status === 'Cancelled' ||
      event.status === 'Covered' ||
      event.status === 'Uncovered';
      
    if (isFinalStatus) return false;

    // Admins can edit any non-final event
    if (this.authService.isAdmin()) return true;

    // Communication Managers can edit any non-completed event
    if (this.authService.isCommunicationManager()) return true;

    // Department Managers can edit non-completed events from their own department
    const user = this.authService.getCurrentUser();
    if (this.authService.isManager() && user?.departmentGuid === event.raw.department.id) {
      return true;
    }

    // Creators can edit their own non-completed events
    if (event.raw.createdBy.id === user?.adObjectId) {
      return true;
    }

    return false;
  }

  canDeleteEvent(event: TableEvent): boolean {
    // Admins can always delete
    if (this.authService.isAdmin()) return true;

    // Managers / Communication Managers can ONLY delete if they are the creator AND event is in Draft
    const user = this.authService.getCurrentUser();
    const isCreator = event.raw.createdBy?.id === user?.adObjectId;
    const isDraft = event.status === 'Draft';

    return isCreator && isDraft;
  }

  requiresVerification(event: Event): boolean {
    const isReviewableStatus = event.status === 'Ongoing' || event.status === 'Completed';
    return isReviewableStatus && this.getSubmittedAssignmentCount(event) > 0;
  }

  requiresFinalization(event: Event): boolean {
    if (event.status !== 'Completed') return false;

    const assignments = this.getEventAssignments(event);
    if (assignments.length === 0) return true;

    // Ready if no assignments are currently 'Submitted' (waiting for dept manager)
    // AND every assignment has been acted upon (Verified or Revision Requested)
    return assignments.every(a =>
      a.status === 'VerifiedByCreator' ||
      a.status === 'RevisionRequested' ||
      a.status === 'Declined' ||
      a.status === 'Covered' ||
      a.status === 'Uncovered'
    );
  }

  getSubmittedAssignmentCount(event: Event): number {
    const assignments = this.getEventAssignments(event);
    if (assignments.length > 0) {
      return assignments.filter(assignment => assignment.status === 'Submitted').length;
    }

    return event.hasSubmittedAssignments ? 1 : 0;
  }

  getVerificationTooltip(event: Event): string {
    const count = this.getSubmittedAssignmentCount(event);
    return `${count} staff member${count === 1 ? '' : 's'} have submitted coverage for verification.`;
  }

  private getEventAssignments(event: Event): Assignment[] {
    if (!event.assignments) return [];

    return Object.values(event.assignments)
      .filter((assignments): assignments is Assignment[] => Array.isArray(assignments))
      .flat();
  }

  generateICS(): void {
    const event = this.nextAssignment;
    if (!event) return;

    try {
      const startDate = new Date(event.date);
      // Assume 2 hour duration if not specified
      const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));

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
        `SUMMARY:${this.escapeICSText(event.name)}`,
        `LOCATION:${this.escapeICSText(event.location)}`,
        `DESCRIPTION:${this.escapeICSText('Role: ' + this.getUserRoleInEvent(event.id))}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Tactical calendar sync complete', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error generating ICS:', error);
      this.showError('Failed to generate calendar file');
    }
  }

  private escapeICSText(text: string): string {
    return text.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
