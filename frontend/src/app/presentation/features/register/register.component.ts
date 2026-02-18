// register.component.ts
// ============================================
// EventPortal Registration — Modern UI, Full Functionality
// Enhanced dropdown icons, password strength, reactive form
// ============================================

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

// Services & Models
// import { AuthService } from '../../../core/auth/auth.service';
// import { AuthUser, RegisterRequest } from '../../../core/models/auth-user.model';

// ---------- Constants ----------
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  EMPLOYEE: 'EMPLOYEE',
} as const;
export type Role = keyof typeof ROLES;

export const DEPARTMENTS = {
  INFORMATION_TECHNOLOGY: 1,
  HUMAN_RESOURCES: 2,
  FINANCE: 3,
  MARKETING: 4,
  OPERATIONS: 5,
  COMMUNICATION: 6,
  GENERAL_STAFF: 7,
} as const;
export type DepartmentId = typeof DEPARTMENTS[keyof typeof DEPARTMENTS];

export const DEPARTMENT_LIST = [
  { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Information Technology', value: DEPARTMENTS.INFORMATION_TECHNOLOGY },
  { id: '4fa85f64-5717-4562-b3fc-2c963f66afa7', name: 'Human Resources', value: DEPARTMENTS.HUMAN_RESOURCES },
  { id: '5fa85f64-5717-4562-b3fc-2c963f66afa8', name: 'Finance', value: DEPARTMENTS.FINANCE },
  { id: '6fa85f64-5717-4562-b3fc-2c963f66afa9', name: 'Marketing', value: DEPARTMENTS.MARKETING },
  { id: '7fa85f64-5717-4562-b3fc-2c963f66afb0', name: 'Operations', value: DEPARTMENTS.OPERATIONS },
  { id: '8fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'Communication', value: DEPARTMENTS.COMMUNICATION },
  { id: '9fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'General Staff', value: DEPARTMENTS.GENERAL_STAFF },
];

// Mock interfaces for build to pass
interface RegisterRequest {
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  departmentId: string;
  password: string;
  confirmPassword: string;
}

interface AuthUser {
  fullName: string;
  email: string;
  role: string;
}

// Mock AuthService for demonstration
class MockAuthService {
  register(data: RegisterRequest) {
    return {
      subscribe: (callbacks: { next: (user: AuthUser) => void; error: (err: any) => void }) => {
        setTimeout(() => {
          callbacks.next({ fullName: data.fullName, email: data.email, role: data.role });
        }, 1500);
      },
    };
  }
}

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  isLoading = false;

  // Form
  signUpForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  // Password strength
  passwordStrength = 0;

  // Time
  currentDate = new Date();
  private timeInterval: any;

  // Data
  roles = ROLES;
  roleKeys = Object.keys(ROLES);
  departmentList = DEPARTMENT_LIST;

  // Services
  private fb = inject(FormBuilder);
  // private authService = inject(AuthService);
  private authService = new MockAuthService(); // Using mock for build
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.initSignUpForm();
    this.watchPasswordStrength();

    // Live time update (every minute)
    this.timeInterval = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  // ---------- Form Initialization ----------
  initSignUpForm(): void {
    this.signUpForm = this.fb.group(
      {
        employeeId: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]+$/),
            Validators.minLength(4),
          ],
        ],
        fullName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^[a-zA-Z\s]+$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        role: ['EMPLOYEE', [Validators.required]],
        departmentId: [
          '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          [Validators.required],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        agreeTerms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Custom validator: password match
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  // ---------- Password Strength ----------
  watchPasswordStrength(): void {
    this.signUpForm.get('password')?.valueChanges.subscribe((password: string) => {
      this.passwordStrength = this.calculatePasswordStrength(password);
    });
  }

  calculatePasswordStrength(password: string): number {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  }

  getPasswordStrengthLabel(): string {
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[this.passwordStrength] || 'Weak';
  }

  // ---------- Icon helpers for template (rich dropdowns) ----------
  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'admin_panel_settings';
      case 'MANAGER':
        return 'supervisor_account';
      case 'STAFF':
        return 'badge';
      case 'EMPLOYEE':
        return 'person';
      default:
        return 'work';
    }
  }

  getDepartmentIcon(deptName: string): string {
    const name = deptName.toLowerCase();
    if (name.includes('information')) return 'computer';
    if (name.includes('human')) return 'people';
    if (name.includes('finance')) return 'account_balance';
    if (name.includes('marketing')) return 'campaign';
    if (name.includes('operations')) return 'settings';
    if (name.includes('communication')) return 'chat';
    if (name.includes('general')) return 'groups';
    return 'business';
  }

  // ---------- Submit ----------
  onSignUp(): void {
    if (this.signUpForm.valid) {
      this.isLoading = true;

      const registerData: RegisterRequest = {
        employeeId: this.signUpForm.value.employeeId,
        fullName: this.signUpForm.value.fullName,
        email: this.signUpForm.value.email,
        role: this.signUpForm.value.role,
        departmentId: this.signUpForm.value.departmentId,
        password: this.signUpForm.value.password,
        confirmPassword: this.signUpForm.value.confirmPassword,
      };

      // Simulate API call (replace with actual authService.register)
      this.authService.register(registerData).subscribe({
        next: (user: AuthUser) => {
          this.isLoading = false;
          this.snackBar.open(`🎉 Registration successful! Welcome, ${user.fullName}!`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Registration failed. Please try again.';
          if (error.error) {
            if (typeof error.error === 'string') errorMessage = error.error;
            else if (error.error.message) errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      this.signUpForm.markAllAsTouched();
      this.showFormErrors();
    }
  }

  // ---------- Error display ----------
  showFormErrors(): void {
    const errors = [];

    if (this.employeeId?.hasError('required')) errors.push('Employee ID is required');
    else if (this.employeeId?.hasError('pattern')) errors.push('Employee ID must contain only numbers');
    else if (this.employeeId?.hasError('minlength')) errors.push('Employee ID must be at least 4 digits');
    else if (this.fullName?.hasError('required')) errors.push('Full name is required');
    else if (this.fullName?.hasError('minlength')) errors.push('Full name must be at least 2 characters');
    else if (this.fullName?.hasError('pattern')) errors.push('Full name can only contain letters and spaces');
    else if (this.email?.hasError('required')) errors.push('Email is required');
    else if (this.email?.hasError('email')) errors.push('Please enter a valid email');
    else if (this.role?.hasError('required')) errors.push('Role is required');
    else if (this.departmentId?.hasError('required')) errors.push('Department is required');
    else if (this.password?.hasError('required')) errors.push('Password is required');
    else if (this.password?.hasError('minlength')) errors.push('Password must be at least 8 characters');
    else if (this.password?.hasError('pattern')) errors.push('Must contain uppercase, number & special character');
    else if (this.confirmPassword?.hasError('required')) errors.push('Please confirm your password');
    else if (this.signUpForm.hasError('passwordMismatch')) errors.push('Passwords do not match');
    else if (this.agreeTerms?.hasError('required')) errors.push('You must agree to the terms and conditions');

    if (errors.length > 0) {
      this.snackBar.open(errors[0], 'Close', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }

  // ---------- Navigation ----------
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // ---------- Getters for template ----------
  get employeeId() {
    return this.signUpForm.get('employeeId');
  }
  get fullName() {
    return this.signUpForm.get('fullName');
  }
  get email() {
    return this.signUpForm.get('email');
  }
  get role() {
    return this.signUpForm.get('role');
  }
  get departmentId() {
    return this.signUpForm.get('departmentId');
  }
  get password() {
    return this.signUpForm.get('password');
  }
  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }
  get agreeTerms() {
    return this.signUpForm.get('agreeTerms');
  }
}