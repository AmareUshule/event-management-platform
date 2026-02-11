import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  stats = [
    { value: '150+', label: 'Events Managed', icon: 'event' },
    { value: '5,000+', label: 'Participants', icon: 'people' },
    { value: '99%', label: 'Satisfaction', icon: 'verified' },
    { value: '24/7', label: 'Support', icon: 'support_agent' }
  ];

  features = [
    {
      icon: 'calendar_today',
      title: 'Centralized Planning',
      description: 'Streamline event organization with intelligent scheduling and resource allocation'
    },
    {
      icon: 'analytics',
      title: 'Real-time Analytics',
      description: 'Monitor event metrics, attendance, and performance with live dashboards'
    },
    {
      icon: 'security',
      title: 'Enterprise Security',
      description: 'Military-grade encryption and role-based access control for sensitive data'
    },
    {
      icon: 'notifications',
      title: 'Smart Notifications',
      description: 'Automated reminders and updates via email, SMS, and in-app notifications'
    },
    {
      icon: 'cloud_upload',
      title: 'Document Management',
      description: 'Secure storage and version control for event-related documents and agendas'
    },
    {
      icon: 'insights',
      title: 'Reporting & Insights',
      description: 'Generate comprehensive reports for stakeholders and decision-makers'
    }
  ];

  testimonials = [
    {
      content: 'The EMS has transformed how we manage corporate events. Efficiency increased by 60%.',
      author: 'Alemayehu Tekle',
      role: 'Head of Corporate Communications',
      department: 'Public Relations'
    },
    {
      content: 'Real-time participant tracking and automated reminders have saved us countless hours.',
      author: 'Martha Gebre',
      role: 'Event Coordinator',
      department: 'HR Department'
    }
  ];

  ngOnInit(): void {
    // Any initialization logic
  }
}