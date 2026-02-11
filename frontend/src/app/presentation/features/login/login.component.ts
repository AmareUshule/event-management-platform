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
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';


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
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  environment = environment;
  
  // Development info
  devUsers = [
    { username: 'amare.ushule', password: 'demo123', role: 'Admin' },
    { username: 'selam.tesfaye', password: 'demo123', role: 'HR Manager' },
    { username: 'john.doe', password: 'demo123', role: 'Finance Manager' }
  ];
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

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
        
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
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