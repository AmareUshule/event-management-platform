import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  signUpForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  currentDate = new Date();

  // Password strength properties
  passwordStrength = 0;
  hasUpperCase = false;
  hasNumber = false;
  hasSpecialChar = false;
  isLongEnough = false;

  // Role keys
  roleKeys: string[] = ['ADMIN', 'MANAGER', 'STAFF', 'EMPLOYEE'];

  // Department list
  departmentList = [
    { id: 1, name: 'Information Technology', code: 'IT' },
    { id: 2, name: 'Human Resources', code: 'HR' },
    { id: 3, name: 'Finance', code: 'FIN' },
    { id: 4, name: 'Marketing', code: 'MKT' },
    { id: 5, name: 'Operations', code: 'OPS' },
    { id: 6, name: 'Communication', code: 'COM' },
    { id: 7, name: 'General Staff', code: 'GEN' }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  // ========== FORM INITIALIZATION ==========
  private initializeForm(): void {
    this.signUpForm = this.fb.group({
      employeeId: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(4)
      ]],
      fullName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern('^[a-zA-Z ]*$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      role: ['', Validators.required],
      departmentId: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator()
      ]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  // ========== CUSTOM VALIDATORS ==========
  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      
      this.hasUpperCase = /[A-Z]/.test(value);
      this.hasNumber = /[0-9]/.test(value);
      this.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
      this.isLongEnough = value.length >= 8;

      const valid = this.hasUpperCase && this.hasNumber && this.hasSpecialChar && this.isLongEnough;
      
      this.updatePasswordStrength(value);
      
      return valid ? null : { weakPassword: true };
    };
  }

  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  };

  // ========== PASSWORD STRENGTH METHODS ==========
  private updatePasswordStrength(password: string): void {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    this.passwordStrength = strength;
  }

  getPasswordStrengthLabel(): string {
    switch (this.passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  }

  getStrengthClass(): string {
    switch (this.passwordStrength) {
      case 0: case 1: return 'weak';
      case 2: return 'fair';
      case 3: return 'good';
      case 4: return 'strong';
      default: return '';
    }
  }

  getSegmentColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #f44336, #d32f2f)', // Red for weak
      'linear-gradient(135deg, #ff9800, #f57c00)', // Orange for fair
      'linear-gradient(135deg, #4caf50, #388e3c)', // Green for good
      'linear-gradient(135deg, #2e7d32, #1b5e20)'  // Dark green for strong
    ];
    
    if (index < this.passwordStrength) {
      return colors[Math.min(index, colors.length - 1)];
    }
    return '#e0e0e0';
  }

  checkPasswordStrength(): void {
    const password = this.password?.value || '';
    this.updatePasswordStrength(password);
  }

  // ========== FIELD-SPECIFIC METHODS ==========
  animateField(fieldName: string): void {
    // Add animation class to field
    const field = document.querySelector(`[formcontrolname="${fieldName}"]`);
    field?.classList.add('field-animated');
    
    // Remove class after animation
    setTimeout(() => {
      field?.classList.remove('field-animated');
    }, 300);
  }

  getEmployeeIdError(): string {
    if (this.employeeId?.hasError('required')) {
      return 'Employee ID is required';
    }
    if (this.employeeId?.hasError('pattern')) {
      return 'Please enter numbers only';
    }
    if (this.employeeId?.hasError('minlength')) {
      return 'Must be at least 4 digits';
    }
    return 'Invalid employee ID';
  }

  suggestEmailDomain(): string {
    const email = this.email?.value || '';
    if (!email || email.includes('@')) return '';
    
    const domains = ['@company.com', '@gmail.com', '@outlook.com', '@eep.com.et'];
    const suggestions = domains.map(d => email + d);
    return suggestions[0]; // Return first suggestion
  }

  getRoleDescription(role: string): string {
    const descriptions: Record<string, string> = {
      'ADMIN': 'Full system access',
      'MANAGER': 'Manage department & events',
      'STAFF': 'Event operations',
      'EMPLOYEE': 'Basic access'
    };
    return descriptions[role] || '';
  }

  getDepartmentColor(deptId: number): string {
    const colors: Record<number, string> = {
      1: '#2196F3', // IT - Blue
      2: '#9C27B0', // HR - Purple
      3: '#FF9800', // Finance - Orange
      4: '#E91E63', // Marketing - Pink
      5: '#00BCD4', // Operations - Cyan
      6: '#4CAF50', // Communication - Green
      7: '#607D8B'  // General Staff - Blue Grey
    };
    return colors[deptId] || '#9E9E9E';
  }

  getDepartmentCode(deptId: number): string {
    const dept = this.departmentList.find(d => d.id === deptId);
    return dept?.code || '';
  }

  // ========== FORM SUBMISSION ==========
  onSignUp(): void {
    if (this.signUpForm.valid) {
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.showSuccess('Account created successfully!');
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.markFormGroupTouched(this.signUpForm);
      this.showError('Please fix the errors in the form');
    }
  }

  socialLogin(provider: string): void {
    this.isLoading = true;
    
    // Simulate social login
    setTimeout(() => {
      this.isLoading = false;
      this.showInfo(`Continuing with ${provider}...`);
    }, 1000);
  }

  // ========== UTILITY METHODS ==========
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // ========== GETTERS ==========
  get employeeId() { return this.signUpForm.get('employeeId'); }
  get fullName() { return this.signUpForm.get('fullName'); }
  get email() { return this.signUpForm.get('email'); }
  get role() { return this.signUpForm.get('role'); }
  get departmentId() { return this.signUpForm.get('departmentId'); }
  get password() { return this.signUpForm.get('password'); }
  get confirmPassword() { return this.signUpForm.get('confirmPassword'); }
  get agreeTerms() { return this.signUpForm.get('agreeTerms'); }
  get passwordsMatch(): boolean {
    const password = this.password?.value;
    const confirm = this.confirmPassword?.value;
    return password === confirm;
  }
}