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
import { Event, EventStatus, EventType } from '../../models/event.model';
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
  // Make enums available in template
  readonly EventType = EventType;
  readonly EventStatus = EventStatus;

  // Step Management
  currentStep = 0;
  progressPercentage = 0;
  isSubmitting = false;
  formInitialized = false;
  
  // Steps Configuration
  steps = [
    { label: 'Basic Details', icon: 'info', description: 'Event title and description' },
    { label: 'Date & Time', icon: 'schedule', description: 'Schedule your event' },
    { label: 'Location', icon: 'location_on', description: 'Physical or virtual location' },
    { label: 'Host Department', icon: 'groups', description: 'Department information' }
  ];

  // Data Sources
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
    { id: 1, name: 'Project Launch', description: 'New project kickoff events' },
    { id: 2, name: 'Workshop / Training', description: 'Skill development sessions' },
    { id: 3, name: 'Media Visit', description: 'Press and media related events' },
    { id: 4, name: 'Inspection', description: 'Internal or external inspections' },
    { id: 5, name: 'Board Meeting', description: 'Board and executive meetings' },
    { id: 6, name: 'Team Building', description: 'Team bonding activities' },
    { id: 7, name: 'Conference', description: 'Large scale conferences' },
    { id: 8, name: 'Networking Event', description: 'Professional networking' }
  ];

  // Form
  eventForm!: FormGroup;

  // Step validation mapping
  private stepValidators: Record<number, string[]> = {
    0: ['title', 'eventCategoryId'],
    1: ['startDateTime', 'endDateTime'],
    3: ['departmentId']
  };

  // Cleanup subject for subscriptions
  private destroy$ = new Subject<void>();

  // Services
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  // =============== LIFECYCLE HOOKS ===============

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============== PUBLIC GETTERS ===============

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
    return this.eventForm?.get('eventType')?.value === EventType.PHYSICAL
      ? this.eventForm?.get('address')?.valid
      : this.eventForm?.get('meetingLink')?.valid;
  }

  get stepFourValid(): boolean {
    return this.isStepValid(3);
  }

  // =============== PUBLIC METHODS ===============

  getDepartmentName(id: number): string {
    const dept = this.departments.find(d => d.id === id);
    return dept ? dept.name : 'Unknown Department';
  }

  getEventCategoryName(id: number): string {
    const category = this.eventCategories.find(c => c.id === id);
    return category ? category.name : 'Unknown Category';
  }

  getFieldError(fieldName: string): string {
    const control = this.eventForm?.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'This field is required';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['invalidDate']) return 'End date must be after start date';
    
    return 'Invalid field';
  }

  // Navigation Methods
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

  // Form Submission
  submitForApproval(): void {
    this.submitEvent(EventStatus.PENDING);
  }

  saveAsDraft(): void {
    this.submitEvent(EventStatus.DRAFT);
  }

  // =============== PRIVATE METHODS ===============

  private initializeComponent(): void {
    console.log('🚀 Initializing EventCreateComponent');
    
    // Initialize form first
    this.initForm();
    this.formInitialized = true;
    
    // Check authentication
    if (!this.checkAuthentication()) return;
    
    // Check permissions
    if (!this.checkPermissions()) return;
    
    // Setup form enhancements
    this.setupEventTypeValidation();
    this.setupDateValidation();
    this.autoFillUserDepartment();
    
    // Update initial progress
    this.updateProgress();
    
    console.log('✅ Component initialized successfully');
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

  private checkAuthentication(): boolean {
    if (!this.authService.isAuthenticated()) {
      console.log('🔒 User not authenticated, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/events/create' } 
      });
      return false;
    }
    return true;
  }

  private checkPermissions(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showError('User not found');
      this.router.navigate(['/login']);
      return false;
    }

    const hasPermission = this.authService.isAdmin() || 
                          this.authService.isManager() || 
                          this.authService.canCreateEvents();
    
    if (!hasPermission) {
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

  private setupEventTypeValidation(): void {
    this.eventForm.get('eventType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(eventType => {
        this.updateLocationValidators(eventType);
      });
  }

  private updateLocationValidators(eventType: EventType): void {
    const addressControl = this.eventForm.get('address');
    const meetingLinkControl = this.eventForm.get('meetingLink');

    if (eventType === EventType.PHYSICAL) {
      addressControl?.setValidators([Validators.required, Validators.minLength(5)]);
      meetingLinkControl?.clearValidators();
      meetingLinkControl?.setValue('');
    } else {
      meetingLinkControl?.setValidators([
        Validators.required,
        Validators.pattern('https?://.+')
      ]);
      addressControl?.clearValidators();
      addressControl?.setValue('');
    }

    addressControl?.updateValueAndValidity();
    meetingLinkControl?.updateValueAndValidity();
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
    
    return controls.every(control => {
      const formControl = this.eventForm.get(control);
      return formControl?.valid;
    });
  }

  public isCurrentStepValid(): boolean {
    return this.isStepValid(this.currentStep);
  }

  private updateProgress(): void {
    this.progressPercentage = ((this.currentStep + 1) / this.steps.length) * 100;
  }

  private prepareEventData(formData: any): Event {
    const location = formData.eventType === EventType.PHYSICAL
      ? formData.address
      : formData.meetingLink;

    const currentUserId = this.authService.getCurrentUserId();
    
    const eventData: Event = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      eventCategoryId: formData.eventCategoryId,
      startDate: this.formatDateToISO(formData.startDateTime),
      endDate: this.formatDateToISO(formData.endDateTime),
      eventType: formData.eventType,
      location: location?.trim() || '',
      departmentId: formData.departmentId,
      status: EventStatus.PENDING,
      createdBy: currentUserId
    };

    // Remove undefined fields
    Object.keys(eventData).forEach(key => {
      if ((eventData as any)[key] === undefined) {
        delete (eventData as any)[key];
      }
    });

    return eventData;
  }

  private formatDateToISO(date: Date | string): string {
    if (!date) return '';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }
      return dateObj.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  private submitEvent(status: EventStatus): void {
    console.log(`📝 Submitting event with status: ${status}`);
    
    if (!this.eventForm.valid || this.isSubmitting) {
      this.markFormGroupTouched(this.eventForm);
      this.showError('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    
    try {
      const formData = this.eventForm.value;
      const eventData = this.prepareEventData(formData);
      eventData.status = status;

      console.log('📦 Sending to API:', eventData);

      this.eventService.createEvent(eventData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          
          console.log('✅ Event created:', response);
          
          const message = status === EventStatus.PENDING 
            ? 'Event submitted for approval!' 
            : 'Draft saved successfully!';
          
          this.showSuccess(message);
          
          setTimeout(() => {
            this.router.navigate(['/events']);
          }, 1500);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('❌ Error:', error);
          this.showError(error.message || 'Failed to create event');
        }
      });
    } catch (error) {
      this.isSubmitting = false;
      console.error('❌ Error preparing data:', error);
      this.showError('An error occurred while preparing the event data');
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