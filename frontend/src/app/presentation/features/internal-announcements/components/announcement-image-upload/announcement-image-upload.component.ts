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

  isImage(file: AnnouncementImage): boolean {
    return !file.contentType || file.contentType.startsWith('image/') || 
           (file.imageUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) !== null);
  }

  isPdf(file: AnnouncementImage): boolean {
    return file.contentType === 'application/pdf' || file.imageUrl.toLowerCase().endsWith('.pdf');
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
            this.snackBar.open('File uploaded successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            this.snackBar.open('Failed to upload file', 'Close', { duration: 3000 });
          }
        });
    }
  }

  deleteFile(fileId: string): void {
    // Optional: implement delete if service supports it
    this.images = this.images.filter(img => img.id !== fileId);
  }

  triggerUpload(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
}
