import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnnouncementService } from '../../services/announcement.service';
import { AnnouncementImage } from '../../models/announcement.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-announcement-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './announcement-image-upload.component.html',
  styleUrls: ['./announcement-image-upload.component.scss']
})
export class AnnouncementImageUploadComponent implements OnInit {
  private announcementService = inject(AnnouncementService);
  private snackBar = inject(MatSnackBar);

  @Input() announcementId!: string;
  @Input() existingImages: AnnouncementImage[] = [];

  images: AnnouncementImage[] = [];
  isUploading: boolean = false;

  ngOnInit(): void {
    this.images = [...this.existingImages];
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.announcementService.uploadImage(this.announcementId, file)
        .pipe(finalize(() => this.isUploading = false))
        .subscribe({
          next: (image) => {
            this.images.push(image);
            this.snackBar.open('Image uploaded successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            this.snackBar.open('Failed to upload image', 'Close', { duration: 3000 });
          }
        });
    }
  }

  triggerUpload(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
}
