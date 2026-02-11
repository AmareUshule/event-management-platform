import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  rememberMe = false;
  
  // Feature slides for the brand panel
  features = [
    {
      icon: 'event',
      title: 'Event Planning',
      description: 'Streamline event organization with intelligent scheduling'
    },
    {
      icon: 'analytics',
      title: 'Real-time Analytics',
      description: 'Monitor event metrics and performance in real-time'
    },
    {
      icon: 'security',
      title: 'Enterprise Security',
      description: 'Military-grade encryption for sensitive data'
    },
    {
      icon: 'collaboration',
      title: 'Team Collaboration',
      description: 'Seamless coordination across departments'
    }
  ];
  
  currentFeature = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.pattern(/^EEP-ID-\d{5}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Auto-rotate features every 5 seconds
    setInterval(() => {
      this.currentFeature = (this.currentFeature + 1) % this.features.length;
    }, 5000);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        // In real app, navigate to dashboard
        console.log('Login successful:', this.loginForm.value);
        // this.router.navigate(['/dashboard']);
        
        // Show success message (would be replaced with proper notification)
        alert('Login successful! Redirecting to dashboard...');
      }, 1500);
    }
  }

  requestAccess(): void {
    const subject = 'Access Request - Event Management System';
    const body = `Dear IT Support,\n\nI am requesting access to the Event Management System.\n\nEmployee Details:\n• Name: \n• Department: \n• Employee ID (if known): \n• Reason for access: \n\nThank you.`;
    window.open(`mailto:it-support@eep.com.et?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  }

  getFeatureIcon(index: number): string {
    return index === this.currentFeature ? 'check_circle' : this.features[index].icon;
  }
}