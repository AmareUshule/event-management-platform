import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  authService = inject(AuthService);

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get dashboardRoute(): string {
    return this.authService.getDashboardRoute();
  }

    {
      icon: 'calendar_today',
      title: 'Centralized Planning',
      description: 'Streamline event organization with intelligent scheduling and resource allocation',
      isAccent: false
    },
    {
      icon: 'work',
      title: 'Internal Vacancy Portal',
      description: 'Upload and publish internal vacancy announcements for employees across the organization.',
      isAccent: false
    },
    {
      icon: 'analytics',
      title: 'Real-time Analytics',
      description: 'Monitor event metrics, attendance, and performance with live dashboards',
      isAccent: true
    },
    {
      icon: 'notifications',
      title: 'Smart Notifications',
      description: 'Automated reminders and updates via email, SMS, and in-app notifications',
      isAccent: true
    },
  ];
}