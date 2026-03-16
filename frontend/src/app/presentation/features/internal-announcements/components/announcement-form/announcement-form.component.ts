import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto, CreateJobVacancyDto } from '../../models/announcement.model';

import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../../../core/auth/auth.service';
import { DepartmentService, Department } from '../../services/department.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './announcement-form.component.html',
  styleUrls: ['./announcement-form.component.scss']
})
export class AnnouncementFormComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private departmentService = inject(DepartmentService);
  private cdr = inject(ChangeDetectorRef);

  @Input() announcement: Announcement | null = null;
  @Input() isLoading = false;
  
  @Output() submitForm = new EventEmitter<{ dto: CreateAnnouncementDto | UpdateAnnouncementDto, files: File[] }>();
  @Output() cancel = new EventEmitter<void>();

  selectedCoverImage: File | null = null;
  coverImagePreview: string | null = null;
  selectedFiles: File[] = [];

  departments: Department[] = [];

  announcementTypes = [
    { value: 'General', label: 'General Announcement' },
    { value: 'JobOpening', label: 'Internal Job Opening' },
    { value: 'DocumentPost', label: 'Document Post' }
  ];

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', [Validators.required]],
    type: ['General', [Validators.required]],
    departmentId: [null, [Validators.required]],
    deadline: [null],
    coverImageUrl: [null], // For existing cover image or to set a default one
    jobVacancies: this.fb.array([])
  });

  ngOnInit(): void {
    this.fetchDepartments();

    if (this.announcement) {
      this.form.patchValue({
        title: this.announcement.title,
        content: this.announcement.content,
        type: this.announcement.type,
        departmentId: this.announcement.department?.id,
        deadline: this.announcement.deadline,
        coverImageUrl: this.announcement.coverImageUrl
      });

      if (this.announcement.jobVacancies && this.announcement.jobVacancies.length > 0) {
        this.announcement.jobVacancies.forEach(job => this.addJobVacancy(job));
      }

      if (this.announcement.coverImageUrl) {
        this.coverImagePreview = this.announcement.coverImageUrl;
      }
    } else {
      // Default to user's department
      const user = this.authService.getCurrentUser();
      if (user?.departmentGuid) {
        this.form.patchValue({ departmentId: user.departmentGuid });
      }
    }

    this.form.get('type')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(type => {
        this.updateFormValidity(type);
      });
      this.updateFormValidity(this.form.get('type')?.value); // Initial validity check
  }

  ngAfterViewInit(): void {
    // Force change detection and layout recalculation on open
    this.cdr.detectChanges();
    
    // Sometimes Material components inside an *ngIf or absolute/fixed container
    // don't calculate their width/layout correctly on the first frame.
    // Triggering a resize event or a small timeout with another detectChanges
    // usually fixes the "compressed layout" issue.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      this.cdr.detectChanges();
    }, 100);
  }

  fetchDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (depts) => {
        this.departments = depts;
        // If we have a user department but it wasn't set yet (because depts weren't loaded)
        const user = this.authService.getCurrentUser();
        if (!this.announcement && user?.departmentGuid && !this.form.get('departmentId')?.value) {
          this.form.patchValue({ departmentId: user.departmentGuid });
        }
      },
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  get jobVacancies(): FormArray {
    return this.form.get('jobVacancies') as FormArray;
  }

  addJobVacancy(job?: CreateJobVacancyDto): void {
    const jobGroup = this.fb.group({
      jobTitle: [job?.jobTitle || '', Validators.required],
      jobCode: [job?.jobCode || '', Validators.required],
      grade: [job?.grade || ''],
      requiredNumber: [job?.requiredNumber || null, [Validators.min(1)]],
      workPlace: [job?.workPlace || '', Validators.required],
      requirements: [job?.requirements || ''],
      experience: [job?.experience || ''],
      training: [job?.training || ''],
      certificate: [job?.certificate || ''],
      otherOptionalRequirements: [job?.otherOptionalRequirements || ''],
      workUnit: [job?.workUnit || '']
    });
    this.jobVacancies.push(jobGroup);
  }

  removeJobVacancy(index: number): void {
    this.jobVacancies.removeAt(index);
  }

  get isJobOpeningType(): boolean {
    return this.form.get('type')?.value === 'JobOpening';
  }

  get isDocumentPostType(): boolean {
    return this.form.get('type')?.value === 'DocumentPost';
  }

  onCoverImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCoverImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.coverImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeCoverImage(): void {
    this.selectedCoverImage = null;
    this.coverImagePreview = null;
    this.form.get('coverImageUrl')?.setValue(null);
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    } else {
      this.selectedFiles = [];
    }
  }

  private updateFormValidity(type: string): void {
    const contentControl = this.form.get('content');
    const deadlineControl = this.form.get('deadline');
    const jobVacanciesArray = this.form.get('jobVacancies') as FormArray;

    // Reset validators for all fields that change based on type
    contentControl?.setValidators(null);
    deadlineControl?.setValidators(null);
    jobVacanciesArray.clearValidators();

    if (type === 'General') {
      contentControl?.setValidators([Validators.required]);
    } else if (type === 'JobOpening') {
      deadlineControl?.setValidators([Validators.required]);
      // At least one job vacancy is required for JobOpening type
      jobVacanciesArray.setValidators([Validators.required, Validators.minLength(1)]);
    } else if (type === 'DocumentPost') {
      // Content is optional for document post
    }

    contentControl?.updateValueAndValidity();
    deadlineControl?.updateValueAndValidity();
    jobVacanciesArray.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  onSubmit(): void {
    this.form.markAllAsTouched(); // Mark all fields as touched to display validation errors
    if (this.form.invalid) {
      this.snackBar.open('Please fill all required fields correctly.', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.form.value;
    
    // Ensure deadline is sent as ISO UTC string
    let deadline = formValue.deadline;
    if (deadline instanceof Date) {
      deadline = new Date(Date.UTC(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())).toISOString();
    }

    const dto: CreateAnnouncementDto | UpdateAnnouncementDto = {
      title: formValue.title,
      content: formValue.content,
      type: formValue.type,
      departmentId: formValue.departmentId,
      deadline: deadline,
      coverImageUrl: formValue.coverImageUrl
    };

    if (this.isJobOpeningType) {
        (dto as CreateAnnouncementDto).jobVacancies = formValue.jobVacancies;
    }
    
    this.submitForm.emit({ dto, files: this.selectedFiles });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

