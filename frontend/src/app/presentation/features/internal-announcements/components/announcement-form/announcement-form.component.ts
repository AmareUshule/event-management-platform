import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from '../../models/announcement.model';
import { AnnouncementImageUploadComponent } from '../announcement-image-upload/announcement-image-upload.component';

import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../../../../core/auth/auth.service';
import { DepartmentService, Department } from '../../services/department.service';

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
    AnnouncementImageUploadComponent
  ],
  templateUrl: './announcement-form.component.html',
  styleUrls: ['./announcement-form.component.scss']
})
export class AnnouncementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private departmentService = inject(DepartmentService);

  @Input() announcement: Announcement | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() submitForm = new EventEmitter<CreateAnnouncementDto | UpdateAnnouncementDto>();
  @Output() cancel = new EventEmitter<void>();

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  departments: Department[] = [];

  announcementTypes = [
    { value: 'General', label: 'General Announcement' },
    { value: 'JobOpening', label: 'Internal Job Opening' }
  ];

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', [Validators.required]],
    type: ['General', [Validators.required]],
    departmentId: [null, [Validators.required]],
    deadline: [null]
  });

  ngOnInit(): void {
    this.fetchDepartments();

    if (this.announcement) {
      this.form.patchValue({
        title: this.announcement.title,
        content: this.announcement.content,
        type: this.announcement.type,
        departmentId: this.announcement.department?.id,
        deadline: this.announcement.deadline
      });
    } else {
      // Default to user's department
      const user = this.authService.getCurrentUser();
      if (user?.departmentId) {
        this.form.patchValue({ departmentId: user.departmentId.toString() });
      }
    }
  }

  fetchDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (depts) => {
        this.departments = depts;
        // If we have a user department but it wasn't set yet (because depts weren't loaded)
        const user = this.authService.getCurrentUser();
        if (!this.announcement && user?.departmentId && !this.form.get('departmentId')?.value) {
          this.form.patchValue({ departmentId: user.departmentId.toString() });
        }
      },
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  get isJobOpening(): boolean {
    return this.form.get('type')?.value === 'JobOpening';
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      
      // Ensure deadline is sent as ISO UTC string
      let deadline = formValue.deadline;
      if (deadline instanceof Date) {
        deadline = new Date(Date.UTC(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())).toISOString();
      }

      const data = {
        ...formValue,
        deadline: deadline,
        image: this.selectedImage
      };
      this.submitForm.emit(data);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
