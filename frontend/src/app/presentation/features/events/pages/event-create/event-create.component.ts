// src/app/presentation/features/events/pages/event-create/event-create.component.ts

import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Material imports
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Models
import { EventService } from '../../services/event.service';
import { EventStatus, EventType, EventFormData } from '../../models/event.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { AuthUser } from '../../../../../core/models/auth-user.model';

export interface Department {
  id: number;
  name: string;
}

export interface EventCategory {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent implements OnInit, OnDestroy {

  readonly EventType = EventType;
  readonly EventStatus = EventStatus;

  currentStep = 0;
  progressPercentage = 0;
  isSubmitting = false;
  formInitialized = false;

  steps = [
    { label: 'Basic Details', icon: 'info', description: 'Event title and description' },
    { label: 'Date & Time', icon: 'schedule', description: 'Schedule your event' },
    { label: 'Location', icon: 'location_on', description: 'Physical or virtual location' },
    { label: 'Host Department', icon: 'groups', description: 'Department information' }
  ];

  departments: Department[] = [
    { id: 1, name: 'Information Technology' },
    { id: 2, name: 'Human Resources' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'Operations' },
    { id: 6, name: 'Communication' },
    { id: 7, name: 'General Staff' }
  ];

  eventCategories: EventCategory[] = [
    { id: 1, name: 'Project Launch' },
    { id: 2, name: 'Workshop / Training' },
    { id: 3, name: 'Media Visit' },
    { id: 4, name: 'Inspection' },
    { id: 5, name: 'Board Meeting' },
    { id: 6, name: 'Team Building' },
    { id: 7, name: 'Conference' },
    { id: 8, name: 'Networking Event' }
  ];

  eventForm!: FormGroup;

  private stepValidators: Record<number, string[]> = {
    0: ['title', 'eventCategoryId'],
    1: ['startDateTime', 'endDateTime'],
    3: ['departmentId']
  };

  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  // ==== LIFECYCLE ====

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= GETTERS =================

  get currentUser(): AuthUser | null {
    return this.authService.getCurrentUser();
  }

  get canSubmit(): boolean {
    return this.eventForm?.valid && !this.isSubmitting && this.formInitialized;
  }

  get stepOneValid(): boolean {
    return this.isStepValid(0);
  }

  get stepTwoValid(): boolean {
    return this.isStepValid(1);
  }

  get stepThreeValid(): boolean {
    const type = this.eventForm?.get('eventType')?.value;
    if (type === EventType.PHYSICAL) {
      return this.eventForm?.get('address')?.valid || false;
    } else {
      return this.eventForm?.get('meetingLink')?.valid || false;
    }
  }

  get stepFourValid(): boolean {
    return this.isStepValid(3);
  }

  // ================= PUBLIC METHODS =================

  getFieldError(fieldName: string): string {
    const control = this.eventForm?.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['pattern']) return 'Invalid format. Please enter a valid URL starting with https://';
    if (errors['invalidDate']) return 'End date must be after start date';

    return 'Invalid field';
  }

  getDepartmentName(id: number): string {
    const dept = this.departments.find(d => d.id === id);
    return dept ? dept.name : 'Unknown Department';
  }

  getEventCategoryName(id: number): string {
    const category = this.eventCategories.find(c => c.id === id);
    return category ? category.name : 'Unknown Category';
  }

  // ================= NAVIGATION =================

  navigateToStep(stepIndex: number): void {
    if (stepIndex <= this.currentStep || this.isStepValid(stepIndex)) {
      this.currentStep = stepIndex;
      this.updateProgress();
    }
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1 && this.isCurrentStepValid()) {
      this.currentStep++;
      this.updateProgress();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateProgress();
    }
  }

  submitForApproval(): void {
    this.submitEvent(EventStatus.DRAFT);
  }

  saveAsDraft(): void {
    this.submitEvent(EventStatus.DRAFT);
  }

  // ================= INITIALIZATION =================

  private initializeComponent(): void {
    this.initForm();
    this.formInitialized = true;

    if (!this.checkAuthentication()) return;
    if (!this.checkPermissions()) return;

    this.setupEventTypeValidation();
    this.setupDateValidation();
    this.autoFillUserDepartment();
    this.updateProgress();
  }

  private initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(500)]],
      eventCategoryId: [null, Validators.required],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      eventType: [EventType.PHYSICAL, Validators.required],
      address: [''],
      meetingLink: [''],
      departmentId: [null, Validators.required]
    });
  }

  // ================= VALIDATION =================

  private setupEventTypeValidation(): void {
    this.eventForm.get('eventType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => this.updateLocationValidators(type));
  }

  private updateLocationValidators(type: EventType): void {
    const address = this.eventForm.get('address');
    const meetingLink = this.eventForm.get('meetingLink');

    if (type === EventType.PHYSICAL) {
      address?.setValidators([Validators.required, Validators.minLength(5)]);
      meetingLink?.clearValidators();
      meetingLink?.setValue('');
    } else {
      meetingLink?.setValidators([
        Validators.required,
        Validators.pattern('https?://.+')
      ]);
      address?.clearValidators();
      address?.setValue('');
    }

    address?.updateValueAndValidity();
    meetingLink?.updateValueAndValidity();
  }

  private setupDateValidation(): void {
    this.eventForm.get('startDateTime')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.validateDates());

    this.eventForm.get('endDateTime')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.validateDates());
  }

  private validateDates(): void {
    const start = this.eventForm.get('startDateTime')?.value;
    const end = this.eventForm.get('endDateTime')?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) {
        this.eventForm.get('endDateTime')?.setErrors({ invalidDate: true });
      } else {
        this.eventForm.get('endDateTime')?.setErrors(null);
      }
    }
  }

  private isStepValid(stepIndex: number): boolean {
    const controls = this.stepValidators[stepIndex];
    if (!controls || !this.eventForm) return true;
    return controls.every(control => this.eventForm.get(control)?.valid);
  }

  public isCurrentStepValid(): boolean {
    return this.isStepValid(this.currentStep);
  }

  private updateProgress(): void {
    this.progressPercentage = ((this.currentStep + 1) / this.steps.length) * 100;
  }

  // =========== FIXED SUBMIT METHOD ===========

  private submitEvent(status: EventStatus): void {

    if (!this.eventForm.valid || this.isSubmitting) {
      this.markFormGroupTouched(this.eventForm);
      this.showError('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting = true;

    // Get the raw form data - this matches EventFormData interface
    const formData = this.eventForm.value;

    // Call service with 2 arguments as expected
    this.eventService.createEvent(formData, status).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('✅ Event created successfully:', response);

        const message = status === EventStatus.DRAFT
          ? 'Event submitted for approval!'
          : 'Draft saved successfully!';

        this.showSuccess(message);
        setTimeout(() => {
          const redirectUrl = this.authService.getDashboardRoute();
          this.router.navigate([redirectUrl]);
        }, 1500);


      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError(error.message || 'Failed to create event');
      }
    });
  }

  // ================= HELPERS =================

  private checkAuthentication(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/events/create' } });
      return false;
    }
    return true;
  }

  private checkPermissions(): boolean {
    // Only Admins and Managers are allowed to create events
    if (!this.authService.canCreateEvents()) {
      this.showError('You do not have permission to create events');
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  private autoFillUserDepartment(): void {
    const userDeptId = this.authService.getCurrentUser()?.departmentId;
    if (userDeptId && this.departments.some(d => d.id === userDeptId)) {
      this.eventForm.patchValue({ departmentId: userDeptId });
    }
  }
  
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
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}