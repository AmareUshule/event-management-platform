import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: AuthUser | null = null;
  isMobileMenuOpen = false;
  isLoadingNotifications = false;

  notifications: Notification[] = [];

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoadingNotifications = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications from backend:', err);
        // Fallback to mock data if backend fails
        this.notifications = this.getMockNotifications();
        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      }
    });
  }

  getMockNotifications(): Notification[] {
    return [
      {
        id: 1,
        title: 'New Event Assigned',
        message: 'You have been assigned to "Tech Conference 2026".',
        time: '2 mins ago',
        isRead: false,
        type: 'info'
      },
      {
        id: 2,
        title: 'Draft Approved',
        message: 'Your event "Staff Workshop" has been approved.',
        time: '1 hour ago',
        isRead: false,
        type: 'success'
      }
    ];
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      this.notificationService.markAsRead(id).subscribe({
        next: () => {
          notification.isRead = true;
        },
        error: (err) => {
          console.error('Failed to mark notification as read:', err);
          // Optimistically update even if error for better UX
          notification.isRead = true;
        }
      });
    }
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;
    
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
      },
      error: (err) => {
        console.error('Failed to mark all as read:', err);
        this.notifications.forEach(n => n.isRead = true);
      }
    });
  }

  get roleDisplay(): string {
    return this.user?.roles?.[0] || 'User';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isInCommunicationDepartment(): boolean {
    return this.authService.isInCommunicationDepartment();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
