import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  environment = environment;

  // Mock user credentials for testing
  mockUsers = [
    { username: 'admin.user', password: 'demo123', role: 'Admin' },
    { username: 'com.manager', password: 'demo123', role: 'Communication Manager' },
    { username: 'it.manager', password: 'demo123', role: 'IT Manager' },
    { username: 'hr.manager', password: 'demo123', role: 'HR Manager' },
    { username: 'com.staff', password: 'demo123', role: 'Communication Staff' },
    { username: 'employee.user', password: 'demo123', role: 'Employee' }
  ];

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const credentials = {
        username: this.loginForm.value.username.trim(),
        password: this.loginForm.value.password
      };
      
      this.authService.login(credentials).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.showSuccess(`Welcome back, ${user.fullName}!`);
          
          // Role-based redirect
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getDefaultRoute(user);
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.isLoading = false;
          
          // Clear password field for security
          this.loginForm.get('password')?.setValue('');
          this.loginForm.get('password')?.markAsTouched();
          
          // Show appropriate error message
          if (error?.status === 401) {
            this.showError('Invalid username or password. Please try again.');
          } else if (error?.status === 0) {
            this.showError('Unable to connect to authentication server.');
          } else {
            this.showError('Login failed. Please try again.');
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private getDefaultRoute(user: any): string {
    // Role-based routing
    if (user.roles.includes('ADMIN')) {
      return '/admin/dashboard';
    } else if (user.roles.includes('MANAGER')) {
      if (user.departmentId === 2) { // Communication department
        return '/communication/dashboard';
      }
      return '/manager/dashboard';
    } else if (user.roles.includes('STAFF')) {
      return '/staff/dashboard';
    } else {
      return '/dashboard';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}