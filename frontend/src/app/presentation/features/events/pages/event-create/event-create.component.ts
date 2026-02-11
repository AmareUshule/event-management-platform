import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

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

// Import your models and service
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { EventStatus } from '../../models/event.enums';
import { EventType } from '../../models/event.enums';
import { AuthService } from '../../../../../core/auth/auth.service';
import { environment } from '../../../../../../environments/environment';
import { AuthUser } from '../../../../../core/models/auth-user.model';
 
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
    MatFormFieldModule
  ],
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss']
})
export class EventCreateComponent implements OnInit {
  currentStep = 0;
  progressPercentage = 0;
  isSubmitting = false;

  steps = [
    { label: 'Basic Details', icon: 'info' },
    { label: 'Date & Time', icon: 'schedule' },
    { label: 'Location', icon: 'location_on' },
    { label: 'Host Department', icon: 'groups' }
  ];

  stepDescriptions = [
    'Event title and description',
    'Schedule your event',
    'Physical or virtual location',
    'Department info'
  ];

  // ✅ Update departments to have numeric IDs for API
  departments = [
    { id: 1, name: 'Information Technology' },
    { id: 2, name: 'Human Resources' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'Operations' }
  ];

  // ✅ Event Categories
  eventCategories = [
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

  // Services injection
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    // Guard: check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/events/create' } 
      });
      return;
    }

    // Guard: check if user has permission to create events
    const user = this.authService.getCurrentUser();
    if (!user || !this.authService.hasAnyRole(['EVENT_CREATOR', 'ADMIN', 'MANAGER'])) {
      this.showError('You do not have permission to create events');
      this.router.navigate(['/unauthorized']);
      return;
    }

    // Initialize form and other setup
    this.initForm();
    this.updateProgress();
    this.setupEventTypeValidation();
    this.addDateValidation();
    
    console.log('✅ Event create component initialized for user:', user.fullName);
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(500)]],
      eventCategoryId: [null, Validators.required],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      eventType: ['physical', Validators.required],
      address: [''],
      meetingLink: [''],
      departmentId: [null, Validators.required],
      primaryOfficer: ['', Validators.required]
    });

    // Auto-fill department if user has one
    const userDeptId = this.authService.getCurrentUser()?.departmentId;
    if (userDeptId) {
      this.eventForm.patchValue({ departmentId: userDeptId });
    }
  }

  // =============== FORM DATA TO API MODEL MAPPING ===============

  prepareEventData(formData: any): Event {
    const location = formData.eventType === EventType.PHYSICAL
      ? formData.address
      : formData.meetingLink;

    const eventData: Event = {
      title: formData.title,
      description: formData.description || '',
      eventCategoryId: formData.eventCategoryId,
      startDate: this.formatDateToISO(formData.startDateTime),
      endDate: this.formatDateToISO(formData.endDateTime),
      eventType: formData.eventType,
      location: location || '',
      departmentId: formData.departmentId,
      status: EventStatus.DRAFT,
      createdBy: this.authService.getCurrentUserId() // ✅ Fixed: Now using auth service
    };

    return eventData;
  }

  private formatDateToISO(date: Date | string): string {
    if (!date) return '';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }
      return dateObj.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }

  // =============== FORM VALIDATION ===============

  setupEventTypeValidation(): void {
    this.eventForm.get('eventType')?.valueChanges.subscribe(eventType => {
      const addressControl = this.eventForm.get('address');
      const meetingLinkControl = this.eventForm.get('meetingLink');

      if (eventType === EventType.PHYSICAL) {
        addressControl?.setValidators([Validators.required]);
        meetingLinkControl?.clearValidators();
        meetingLinkControl?.setValue(''); // Clear virtual field
      } else if (eventType === EventType.VIRTUAL) {
        meetingLinkControl?.setValidators([
          Validators.required,
          Validators.pattern('https?://.+')
        ]);
        addressControl?.clearValidators();
        addressControl?.setValue(''); // Clear physical field
      }

      addressControl?.updateValueAndValidity();
      meetingLinkControl?.updateValueAndValidity();
    });
  }

  addDateValidation(): void {
    this.eventForm.get('startDateTime')?.valueChanges.subscribe(() => {
      this.validateDates();
    });

    this.eventForm.get('endDateTime')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  validateDates(): void {
    const start = this.eventForm.get('startDateTime')?.value;
    const end = this.eventForm.get('endDateTime')?.value;

    if (start && end && new Date(end) <= new Date(start)) {
      this.eventForm.get('endDateTime')?.setErrors({ invalidDate: true });
    } else {
      this.eventForm.get('endDateTime')?.setErrors(null);
    }
  }

  // =============== STEP NAVIGATION ===============

  navigateToStep(stepIndex: number): void {
    if (stepIndex <= this.currentStep || this.isStepValid(stepIndex)) {
      this.currentStep = stepIndex;
      this.updateProgress();
    }
  }

  isStepValid(stepIndex: number): boolean {
    const stepValidators: Record<number, string[]> = {
      0: ['title', 'eventCategoryId'],
      1: ['startDateTime', 'endDateTime'],
      3: ['departmentId', 'primaryOfficer']
    };

    const controls = stepValidators[stepIndex];
    if (controls) {
      return controls.every(control => this.eventForm.get(control)?.valid);
    }
    return true;
  }

  isCurrentStepValid(): boolean {
    return this.isStepValid(this.currentStep);
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

  updateProgress(): void {
    this.progressPercentage = ((this.currentStep + 1) / this.steps.length) * 100;
  }

  // =============== FORM SUBMISSION ===============

  submitEvent(status: EventStatus = EventStatus.PENDING): void {
    if (this.eventForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched(this.eventForm);
      this.showError('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    const formData = this.eventForm.value;
    const eventData = this.prepareEventData(formData);
    eventData.status = status;

    console.log('Sending to API:', eventData);

    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Event created successfully:', response);
        
        const message = status === EventStatus.PENDING 
          ? 'Event submitted successfully!' 
          : 'Draft saved successfully!';
        
        this.showSuccess(message);
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating event:', error);
        this.showError('Failed to create event. Please try again.');
      }
    });
  }

  saveAsDraft(): void {
    this.submitEvent(EventStatus.DRAFT);
  }

  // =============== HELPER METHODS ===============

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
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // =============== PUBLIC GETTERS ===============

  getDepartmentName(id: number): string {
    const dept = this.departments.find(d => d.id === id);
    return dept ? dept.name : 'Unknown Department';
  }

  getEventCategoryName(id: number): string {
    const category = this.eventCategories.find(c => c.id === id);
    return category ? category.name : 'Unknown Category';
  }

  get currentUser(): AuthUser | null {
    return this.authService.getCurrentUser();
  }
}