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

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
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

  @Input() announcement: Announcement | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() submitForm = new EventEmitter<CreateAnnouncementDto | UpdateAnnouncementDto>();
  @Output() cancel = new EventEmitter<void>();

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.announcement) {
      this.form.patchValue({
        title: this.announcement.title,
        content: this.announcement.content
      });
    }
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
      const data = {
        ...this.form.value,
        image: this.selectedImage
      };
      this.submitForm.emit(data);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
