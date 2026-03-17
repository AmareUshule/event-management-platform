import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

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
    MatTooltipModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  user: AuthUser | null = null;
  isMobileMenuOpen = false;
  isLoadingNotifications = false;
  unreadCount = 0;
  notifications: Notification[] = [];
  
  private subscriptions = new Subscription();

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.user = this.authService.getCurrentUser();
      
      this.subscriptions.add(
        this.notificationService.unreadCount$.subscribe(count => {
          this.unreadCount = count;
          this.cdr.detectChanges();
        })
      );
      
      this.subscriptions.add(
        this.notificationService.newNotification$.subscribe(notification => {
          this.notifications.unshift(notification);
          if (this.notifications.length > 10) {
            this.notifications.pop();
          }
          this.cdr.detectChanges();
        })
      );
    }
  }

  loadNotifications(): void {
    if (this.isLoadingNotifications) return;
    
    this.isLoadingNotifications = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data.slice(0, 10); // Keep only latest 10
        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications from backend:', err);
        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.cdr.detectChanges();
        }
      });
    }

    if (notification.referenceId) {
      if (notification.type === 'Announcement') {
        this.router.navigate(['/internal-announcements', notification.referenceId]);
      } else if (notification.type === 'Event' || notification.type === 'Assignment') {
        this.router.navigate(['/events', notification.referenceId]);
      }
    }
  }

  markAllAsRead(): void {
    // Note: Backend doesn't have mark-all-read yet, so we loop or just skip for now.
    // Based on requirements, we only need to allow marking notifications as read.
    this.notifications.filter(n => !n.isRead).forEach(n => {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.cdr.detectChanges();
      });
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
