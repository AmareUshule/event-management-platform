import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

// Models
import { AuthUser } from '../../../core/models/auth-user.model';

interface EventData {
  name: string;
  location: string;
  date: Date;
  status: 'published' | 'draft';
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
export class DashboardComponent implements OnInit {
  // Current user
  user: AuthUser | null = null;
  
  // Loading state
  isLoading = false;
  
  // Current date
  currentDate = new Date();
  
  // Selected tab index
  selectedTabIndex = 0;
  
  // Time filters
  timeFrom = '09:00';
  timeTo = '17:00';
  
  // Search term
  searchTerm: string = '';
  
  // Original events data (master copy)
  private originalEvents: EventData[] = [
    {
      name: 'Nam porttitor blandit accumsan.',
      location: 'U.S. Bank Stadium',   
      date: new Date(),   
      status: 'published'
    },
    {
      name: 'Curabitur lobortis id lorem id bibendum. Ut.',
      location: '1190 N 70th St, Wauwatosa',
      date: new Date(2018, 11, 29),  
      status: 'published'
    },
    {
      name: 'Lorem ipsum dolor sit.',
      location: 'Miami Beach',
      date: new Date(2018, 11, 20),
      status: 'draft'
    },
    {
      name: 'Vestibulum rutrum qu.',
      location: 'Miami Beach',
      date: new Date(2018, 11, 19),
      status: 'published'
    },
    {
      name: 'Lorem ipsum do.',
      location: 'Los Angeles',
      date: new Date(2019, 0, 2),
      status: 'draft'
    }
  ];
  
  // Displayed events data (filtered version)
  eventsDataSource: EventData[] = [];
  
  // Table columns
  displayedColumns: string[] = ['id', 'eventName', 'location', 'date', 'actions'];
  
  // Quick stats
  totalEvents = 0;
  publishedEvents = 0;
  draftEvents = 0;
  todaysEvents = 0;
  
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
  
  // Inject services
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.isLoading = true;
    
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Get current user
    this.user = this.authService.getCurrentUser();
    
    // Initialize events data source
    this.eventsDataSource = [...this.originalEvents];
    
    // Calculate statistics
    this.calculateStatistics();
    
    this.isLoading = false;
  }

  private calculateStatistics(): void {
    this.totalEvents = this.originalEvents.length;
    this.publishedEvents = this.originalEvents.filter(e => e.status === 'published').length;
    this.draftEvents = this.originalEvents.filter(e => e.status === 'draft').length;
    this.todaysEvents = this.originalEvents.filter(e => 
      e.date.toDateString() === new Date().toDateString()
    ).length;
  }

  // Search method
  applySearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = filterValue;
    this.filterEvents();
  }

  // Tab change handler
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.filterEvents();
  }

  // Combined filter method for both search and tabs
  private filterEvents(): void {
    // Start with all events
    let filtered = [...this.originalEvents];
    
    // Apply tab filter
    switch (this.selectedTabIndex) {
      case 1: // Published
        filtered = filtered.filter(e => e.status === 'published');
        break;
      case 2: // Draft
        filtered = filtered.filter(e => e.status === 'draft');
        break;
      // case 0: ALL - no filter needed
    }
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(this.searchTerm) ||
        event.location.toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Update the data source
    this.eventsDataSource = filtered;
  }

  // Date filter handler
  filterByDate(range: string): void {
    switch (range) {
      case 'today':
        const today = new Date();
        const filtered = this.originalEvents.filter(e => 
          e.date.toDateString() === today.toDateString()
        );
        this.eventsDataSource = filtered;
        
        // Show result count
        this.snackBar.open(`Found ${filtered.length} event(s) for today`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        break;
    }
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.filterEvents();
  }

  // Action methods
  editEvent(event: EventData): void {
    this.snackBar.open(`Editing: ${event.name}`, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
    // Navigate to edit page
    // this.router.navigate(['/events/edit', event.id]);
  }

  viewEvent(event: EventData): void {
    this.snackBar.open(`Viewing: ${event.name}`, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
    // Navigate to view page
    // this.router.navigate(['/events/view', event.id]);
  }

  publishEvent(event: EventData): void {
    if (event.status === 'draft') {
      event.status = 'published';
      this.snackBar.open(`Published: ${event.name}`, 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.calculateStatistics();
      this.filterEvents();
    }
  }

  deleteEvent(event: EventData): void {
    // In a real app, you'd show a confirmation dialog
    const index = this.originalEvents.indexOf(event);
    if (index > -1) {
      this.originalEvents.splice(index, 1);
      this.filterEvents();
      this.calculateStatistics();
      
      this.snackBar.open(`Deleted: ${event.name}`, 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  // Navigation methods
  navigateToCreateEvent(): void {
    // Check if user can create events
    const canCreateEvents = true; // Replace with actual permission check
    
    if (canCreateEvents) {
      this.router.navigate(['/events/create']);
    } else {
      this.snackBar.open('You do not have permission to create events', 'Close', {
        duration: 3000
      });
    }
  }

  // Logout method
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  // Get department name from departmentId
  get departmentName(): string {
    if (!this.user?.departmentId) return 'Unknown';
    return this.departmentMap[this.user.departmentId] || 'Unknown Department';
  }

  // Get role display
  get roleDisplay(): string {
    if (!this.user?.roles || this.user.roles.length === 0) return 'User';
    return this.user.roles[0];
  }
  
  // Get status class for styling
  getStatusClass(status: string): string {
    return status === 'published' ? 'published' : 'draft';
  }
}