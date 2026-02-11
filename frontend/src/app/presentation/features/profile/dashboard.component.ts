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

// Services
import { AuthService } from '../../../core/auth/auth.service';

// Models
import { AuthUser } from '../../../core/models/auth-user.model';

interface EventData {
  name: string;
  location: string;
  hours: string;
  date: Date;
  capacity: number;
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
    MatChipsModule
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
  
  // Events data
  eventsDataSource: EventData[] = [
    {
      name: 'Nam porttitor blandit accumsan.',
      location: 'U.S. Bank Stadium',
      hours: '09:00am',
      date: new Date(),
      capacity: 500,
      status: 'published'
    },
    {
      name: 'Curabitur lobortis id lorem id bibendum. Ut.',
      location: '1190 N 70th St, Wauwatosa',
      hours: '06:00pm - 11:00pm',
      date: new Date(2018, 11, 29),
      capacity: 300,
      status: 'published'
    },
    {
      name: 'Lorem ipsum dolor sit.',
      location: 'Miami Beach',
      hours: '11:00am - 01:00pm',
      date: new Date(2018, 11, 20),
      capacity: 100,
      status: 'draft'
    },
    {
      name: 'Vestibulum rutrum qu.',
      location: 'Miami Beach',
      hours: '09:00am - 06:00pm',
      date: new Date(2018, 11, 19),
      capacity: 1000,
      status: 'published'
    },
    {
      name: 'Lorem ipsum do.',
      location: 'Los Angeles',
      hours: '02:00pm - 08:00pm',
      date: new Date(2019, 0, 2),
      capacity: 1200,
      status: 'draft'
    }
  ];
  
  // Table columns
  displayedColumns: string[] = ['id', 'eventName', 'location', 'hours', 'date', 'capacity', 'actions'];
  
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
    
    // Calculate statistics
    this.calculateStatistics();
    
    this.isLoading = false;
  }

  private calculateStatistics(): void {
    this.totalEvents = this.eventsDataSource.length;
    this.publishedEvents = this.eventsDataSource.filter(e => e.status === 'published').length;
    this.draftEvents = this.eventsDataSource.filter(e => e.status === 'draft').length;
    this.todaysEvents = this.eventsDataSource.filter(e => 
      e.date.toDateString() === new Date().toDateString()
    ).length;
  }

  // Tab change handler
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.filterEventsByTab(index);
  }

  private filterEventsByTab(index: number): void {
    let filteredEvents: EventData[] = [];
    
    switch (index) {
      case 0: // ALL
        filteredEvents = this.eventsDataSource;
        break;
      case 1: // Published
        filteredEvents = this.eventsDataSource.filter(e => e.status === 'published');
        break;
      case 2: // Draft
        filteredEvents = this.eventsDataSource.filter(e => e.status === 'draft');
        break;
    }
    
    // In a real app, this would trigger an API call
    console.log('Filtered events:', filteredEvents);
  }

  // Date filter handler
  filterByDate(range: string): void {
    switch (range) {
      case 'today':
        const today = new Date();
        const filtered = this.eventsDataSource.filter(e => 
          e.date.toDateString() === today.toDateString()
        );
        console.log('Today\'s events:', filtered);
        break;
      // Add more date ranges as needed
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

  // Get welcome message based on time of day
  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  // Get department name from departmentId
  get departmentName(): string {
    if (!this.user?.departmentId) return 'Unknown';
    return this.departmentMap[this.user.departmentId] || 'Unknown Department';
  }

  // Get role display
  get roleDisplay(): string {
    if (!this.user?.roles || this.user.roles.length === 0) return 'User';
    return this.user.roles[0]; // Return first role, or implement logic based on your needs
  }
}