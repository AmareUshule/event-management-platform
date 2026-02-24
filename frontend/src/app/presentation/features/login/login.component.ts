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
import { AuthUser } from '../../../core/models/auth-user.model';
import { ROLES } from '../../../core/constants/roles.constants';
import { DEPARTMENTS } from '../../../core/constants/departments.constants';

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

  constructor() {
    this.loginForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const credentials = {
        employeeId: this.loginForm.value.employeeId.trim(),
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (user) => {
          this.isLoading = false;
          // Use fullName which is now properly mapped from firstName + lastName
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

          this.showError(error.message || 'Login failed. Please try again.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

private getDefaultRoute(user: AuthUser): string {
  // Role-based routing using your ROLES constant
  if (user.roles?.includes(ROLES.Admin)) {
    return '/admin/dashboard';
  } else if (user.roles?.includes(ROLES.Manager)) {
    if (user.departmentId === DEPARTMENTS.COMMUNICATION) {
      return '/communication/dashboard';
    }
    return '/manager/dashboard';
  } else if (user.roles?.includes(ROLES.Staff)) { 
    return '/staff/dashboard';
  } else {
    return '/dashboard';
  }
}

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
} 