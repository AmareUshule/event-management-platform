import { Component, OnInit, inject, signal, computed, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { EventService } from '../../services/event.service';
import { Event, EventStatus } from '../../models/event.model';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';

import { SkeletonModule } from 'primeng/skeleton';

// Angular Animations
import { trigger, state, style, transition, animate } from '@angular/animations';

type EventFilterKey = 'category' | 'status' | 'department' | 'organizer' | 'location' | 'priority' | 'tags';
type ViewMode = 'table' | 'card' | 'compact' | 'timeline';

@Component({
  selector: 'app-event-discovery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatDividerModule,
    PageHeaderComponent,
    SkeletonModule
  ],
  templateUrl: './event-discovery.component.html',
  styleUrls: ['./event-discovery.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease')
      ]),
      transition('* => void', [
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', opacity: 1 })),
      state('collapsed', style({ height: '0px', opacity: 0 })),
      transition('expanded <=> collapsed', animate('300ms ease'))
    ]),
    trigger('cardEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('rowHover', [
      state('idle', style({ transform: 'translateX(0)' })),
      state('hover', style({ transform: 'translateX(4px)' })),
      transition('idle <=> hover', animate('200ms ease'))
    ]),
    trigger('statusPulse', [
      state('active', style({ boxShadow: '0 0 0 0 rgba(30, 89, 12, 0.4)' })),
      state('inactive', style({ boxShadow: '0 0 0 0 rgba(221, 20, 7, 0.4)' })),
      transition('active <=> inactive', animate('2s ease-in-out'))
    ]),
    trigger('quickActions', [
      state('hidden', style({ opacity: 0, transform: 'translateX(10px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden <=> visible', animate('200ms ease'))
    ])
  ]
})
export class EventDiscoveryComponent implements OnInit {
  private eventService = inject(EventService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Core state
  events = signal<Event[]>([]);
  isLoading = signal<boolean>(true);
  searchTerm = signal<string>('');
  searchControl = new FormControl('');
  isSearchFocused = signal<boolean>(false);
  showSuggestions = signal<boolean>(false);

  // View mode and display
  viewMode = signal<ViewMode>('card');
  selectedEvents = signal<string[]>([]);
  sortField = signal<string>('startDate');
  sortOrder = signal<'asc' | 'desc'>('desc');
  pageSize = signal<number>(12);
  currentPage = signal<number>(0);

  // UI state
  hoveredEventId = signal<string | null>(null);
  showQuickActions = signal<Record<string, boolean>>({});
  expandedRows = signal<Set<string>>(new Set());

  // Recent searches and suggestions
  recentSearches = signal<string[]>([]);
  searchSuggestions = signal<string[]>([
    'Project Launch',
    'Workshop',
    'Board Meeting',
    'Team Building',
    'Conference'
  ]);

  activeFilters = signal<{
    category: string[];
    status: string[];
    department: string[];
    organizer: string[];
    location: string[];
    priority: string[];
    dateRange: { start: Date | null, end: Date | null };
    tags: string[];
  }>({
    category: [],
    status: [],
    department: [],
    organizer: [],
    location: [],
    priority: [],
    dateRange: { start: null, end: null },
    tags: []
  });

  showAdvancedFilters = signal<boolean>(false);
  showQuickFilters = signal<boolean>(true);
  private searchSubject = new Subject<string>();

  filteredEvents = computed(() => {
    let list = this.events();
    const search = this.searchTerm().toLowerCase().trim();
    const filters = this.activeFilters();

    if (search) {
      list = list.filter(e =>
        e.title.toLowerCase().includes(search) ||
        e.description?.toLowerCase().includes(search) ||
        e.eventPlace.toLowerCase().includes(search) ||
        e.category.toLowerCase().includes(search) ||
        e.department.name.toLowerCase().includes(search)
      );
    }

    if (filters.category.length > 0) {
      list = list.filter(e => filters.category.includes(e.category));
    }

    if (filters.status.length > 0) {
      list = list.filter(e => filters.status.includes(e.status));
    }

    if (filters.department.length > 0) {
      list = list.filter(e => filters.department.includes(e.department.name));
    }

    if (filters.location.length > 0) {
      list = list.filter(e =>
        filters.location.some(loc => e.eventPlace.toLowerCase().includes(loc.toLowerCase()))
      );
    }

    if (filters.dateRange.start) {
      const start = new Date(filters.dateRange.start).getTime();
      list = list.filter(e => new Date(e.startDate).getTime() >= start);
    }

    if (filters.dateRange.end) {
      const end = new Date(filters.dateRange.end).getTime();
      list = list.filter(e => new Date(e.endDate).getTime() <= end);
    }

    // Sort events
    list = [...list].sort((a, b) => {
      const field = this.sortField();
      const order = this.sortOrder() === 'asc' ? 1 : -1;

      let aValue: any = a[field as keyof Event];
      let bValue: any = b[field as keyof Event];

      // Handle date fields
      if (field === 'startDate' || field === 'endDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle nested fields
      if (field === 'department') {
        aValue = a.department.name;
        bValue = b.department.name;
      }

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });

    return list;
  });

  paginatedEvents = computed(() => {
    const events = this.filteredEvents();
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return events.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredEvents().length / this.pageSize());
  });

  hasActiveFilters = computed(() => {
    const f = this.activeFilters();
    return f.category.length > 0 || f.status.length > 0 || f.department.length > 0 ||
      f.organizer.length > 0 || f.location.length > 0 || f.priority.length > 0 ||
      f.tags.length > 0 || !!f.dateRange.start || !!f.dateRange.end;
  });

  activeFilterCount = computed(() => {
    const f = this.activeFilters();
    return f.category.length + f.status.length + f.department.length +
      f.organizer.length + f.location.length + f.priority.length + f.tags.length +
      (f.dateRange.start ? 1 : 0) + (f.dateRange.end ? 1 : 0);
  });

  categories = [
    'Project Launch', 'Workshop / Training', 'Media Visit',
    'Inspection', 'Board Meeting', 'Team Building',
    'Conference', 'Networking Event', 'Product Demo',
    'Client Meeting', 'Training Session', 'All Hands'
  ];

  statuses = [
    EventStatus.DRAFT, EventStatus.SCHEDULED, EventStatus.ONGOING,
    EventStatus.COMPLETED, EventStatus.ARCHIVED, EventStatus.CANCELLED
  ];

  departments = [
    'Information Technology', 'Communication', 'Operations',
    'Marketing', 'Finance', 'Human Resources', 'Legal',
    'Sales', 'Research & Development', 'Quality Assurance'
  ];

  priorities = ['High', 'Medium', 'Low'];
  locations = ['Main Office', 'Conference Room A', 'Conference Room B', 'Auditorium', 'Virtual'];

  ngOnInit(): void {
    this.loadEvents();
    this.setupSearchDebouncing();
    this.loadRecentSearches();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.eventService.getAllEvents()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.events.set(data),
        error: (err) => console.error('Failed to load events', err)
      });
  }

  private setupSearchDebouncing(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchTerm.set(searchValue);
      if (searchValue.trim()) {
        this.addToRecentSearches(searchValue.trim());
      }
    });

    this.searchControl.valueChanges.subscribe(value => {
      this.searchSubject.next(value || '');
    });
  }

  private loadRecentSearches(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = localStorage.getItem('event-discovery-recent-searches');
    if (stored) {
      try {
        this.recentSearches.set(JSON.parse(stored));
      } catch {
        this.recentSearches.set([]);
      }
    }
  }

  private addToRecentSearches(search: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const current = this.recentSearches();
    const updated = [search, ...current.filter(s => s !== search)].slice(0, 5);
    this.recentSearches.set(updated);
    localStorage.setItem('event-discovery-recent-searches', JSON.stringify(updated));
  }

  onSearchFocus(): void {
    this.isSearchFocused.set(true);
    this.showSuggestions.set(true);
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.isSearchFocused.set(false);
      this.showSuggestions.set(false);
    }, 150);
  }

  selectSuggestion(suggestion: string): void {
    this.searchControl.setValue(suggestion);
    this.searchTerm.set(suggestion);
    this.showSuggestions.set(false);
    this.addToRecentSearches(suggestion);
  }

  clearRecentSearches(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.recentSearches.set([]);
    localStorage.removeItem('event-discovery-recent-searches');
  }

  toggleFilter(type: EventFilterKey, value: string): void {
    const current = { ...this.activeFilters() };
    const index = current[type].indexOf(value);

    if (index > -1) {
      current[type] = current[type].filter(v => v !== value);
    } else {
      current[type] = [...current[type], value];
    }

    this.activeFilters.set(current);
  }

  setMultiFilter(type: EventFilterKey, values: string[]): void {
    const current = { ...this.activeFilters() };
    current[type] = values;
    this.activeFilters.set(current);
  }

  setDateRange(start: Date | null, end: Date | null): void {
    const current = { ...this.activeFilters() };
    current.dateRange = { start, end };
    this.activeFilters.set(current);
  }

  removeFilter(type: EventFilterKey, value: string): void {
    const current = { ...this.activeFilters() };
    current[type] = current[type].filter(v => v !== value);
    this.activeFilters.set(current);
  }

  clearFilters(): void {
    this.activeFilters.set({
      category: [],
      status: [],
      department: [],
      organizer: [],
      location: [],
      priority: [],
      dateRange: { start: null, end: null },
      tags: []
    });
    this.searchControl.setValue('');
    this.searchTerm.set('');
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  viewEvent(id: string | undefined): void {
    if (id) this.router.navigate(['/events', id]);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      [EventStatus.DRAFT]: '#64748B',
      [EventStatus.SCHEDULED]: '#10B981',
      [EventStatus.ONGOING]: '#3B82F6',
      [EventStatus.COMPLETED]: '#1E590C',
      [EventStatus.CANCELLED]: '#DD1407',
      [EventStatus.ARCHIVED]: '#6B7280'
    };
    return colors[status] || '#64748B';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'High': '#DD1407',
      'Medium': '#F59E0B',
      'Low': '#10B981'
    };
    return colors[priority] || '#64748B';
  }

  // View mode methods
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    // Reset pagination when switching views
    this.currentPage.set(0);
  }

  // Selection methods
  toggleEventSelection(eventId: string): void {
    const current = this.selectedEvents();
    if (current.includes(eventId)) {
      this.selectedEvents.set(current.filter(id => id !== eventId));
    } else {
      this.selectedEvents.set([...current, eventId]);
    }
  }

  selectAllEvents(): void {
    const allIds = this.filteredEvents().map(e => e.id || '');
    this.selectedEvents.set(allIds);
  }

  clearSelection(): void {
    this.selectedEvents.set([]);
  }

  isEventSelected(eventId: string): boolean {
    return this.selectedEvents().includes(eventId);
  }

  // Sorting methods
  setSorting(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
  }

  // Pagination methods
  setPage(page: number): void {
    this.currentPage.set(page);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }

  // Hover and interaction methods
  onRowHover(eventId: string | undefined, isHovering: boolean): void {
    if (!eventId) return;
    this.hoveredEventId.set(isHovering ? eventId : null);
    this.showQuickActions.update(actions => ({
      ...actions,
      [eventId]: isHovering
    }));
  }

  toggleRowExpansion(eventId: string): void {
    const expanded = new Set(this.expandedRows());
    if (expanded.has(eventId)) {
      expanded.delete(eventId);
    } else {
      expanded.add(eventId);
    }
    this.expandedRows.set(expanded);
  }

  isRowExpanded(eventId: string): boolean {
    return this.expandedRows().has(eventId);
  }

  // Quick action methods
  quickFilterByStatus(status: string): void {
    this.clearFilters();
    this.toggleFilter('status', status);
  }

  quickFilterByCategory(category: string): void {
    this.clearFilters();
    this.toggleFilter('category', category);
  }
  editEvent(event: Event, eventElement?: Event): void {
    if (event.id) {
      this.router.navigate(['/events/edit', event.id]);
    }
  }

  duplicateEvent(event: Event): void {
    // Implementation for duplicating event
    console.log('Duplicating event:', event.title);
    // TODO: Implement duplicate functionality
  }

  shareEvent(event: Event): void {
    // Implementation for sharing event
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      // TODO: Show success toast
      console.log('Event URL copied to clipboard');
    });
  }

  archiveEvent(event: Event): void {
    // Implementation for archiving event
    console.log('Archiving event:', event.title);
    // TODO: Implement archive functionality
  }

  manageResources(event: Event): void {
    // Implementation for managing event resources
    console.log('Managing resources for:', event.title);
    // TODO: Implement resource management
  }

  // Batch operations
  batchArchive(): void {
    const selectedIds = this.selectedEvents();
    console.log('Batch archiving events:', selectedIds);
    // TODO: Implement batch archive
    this.clearSelection();
  }

  batchExport(): void {
    const selectedEvents = this.events().filter(e => this.selectedEvents().includes(e.id || ''));
    console.log('Exporting events:', selectedEvents);
    // TODO: Implement export functionality
  }

  // Column visibility (for table view)
  visibleColumns = signal<string[]>([
    'select', 'title', 'category', 'status', 'department', 'location', 'startDate', 'participants', 'actions'
  ]);

  toggleColumnVisibility(column: string): void {
    const current = this.visibleColumns();
    if (current.includes(column)) {
      this.visibleColumns.set(current.filter(c => c !== column));
    } else {
      this.visibleColumns.set([...current, column]);
    }
  }

  isColumnVisible(column: string): boolean {
    return this.visibleColumns().includes(column);
  }

  // Utility methods
  trackByEventId(index: number, event: Event): string | undefined {
    return event.id;
  }

  getEventBannerGradient(event: Event): string {
    const gradients = [
      'linear-gradient(135deg, #1E590C 0%, #DD1407 100%)',
      'linear-gradient(135deg, #DD1407 0%, #1E590C 100%)',
      'linear-gradient(135deg, #1E590C 0%, #64748B 100%)',
      'linear-gradient(135deg, #DD1407 0%, #64748B 100%)',
      'linear-gradient(135deg, #64748B 0%, #1E590C 100%)'
    ];

    // Use event title or id to consistently select a gradient
    const seed = (event.title + (event.id || '')).length;
    return gradients[seed % gradients.length];
  }

  getAssignmentCount(event: Event): number {
    if (!event.assignments) return 0;

    let count = 0;
    Object.values(event.assignments).forEach(assignments => {
      if (Array.isArray(assignments)) {
        count += assignments.length;
      }
    });

    return count;
  }
}
