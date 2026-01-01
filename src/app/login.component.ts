import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  employeeId = '';
  password = '';
  hidePassword = true;

  onSubmit() {
    // In production, connect to authentication service
    console.log('Sign in attempt for:', this.employeeId);
    
    // Simulate API call
    this.simulateLogin();
  }

  private simulateLogin() {
    // Add your authentication logic here
    if (this.employeeId && this.password) {
      console.log('Authentication in progress...');
      // Redirect or show loading state
    }
  }

  requestAccess() {
    window.open('mailto:hr@eep.com.et?subject=EMS Access Request&body=Please provide my details to request access to the Event Management System.', '_blank');
  }
}