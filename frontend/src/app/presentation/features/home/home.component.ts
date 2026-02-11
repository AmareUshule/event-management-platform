import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  
  features = [
    {
      icon: 'calendar_today',
      title: 'Centralized Planning',
      description: 'Streamline event organization with intelligent scheduling and resource allocation',
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
    {
      icon: 'cloud_upload',
      title: 'Document Management',
      description: 'Secure storage and version control for event-related documents and agendas',
      isAccent: false
    },
  ];
}