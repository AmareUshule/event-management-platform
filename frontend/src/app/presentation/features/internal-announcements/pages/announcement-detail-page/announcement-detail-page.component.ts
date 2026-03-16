import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnnouncementService } from '../../services/announcement.service';
import { Announcement, AnnouncementMedia, JobVacancy } from '../../models/announcement.model';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { ImageLightboxComponent } from '../../components/image-lightbox/image-lightbox.component';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { SafeUrlPipe } from '../../../../../shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-announcement-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    RouterModule,
    HeaderComponent,
    MatTableModule, // Add MatTableModule
    MatCardModule, // Add MatCardModule
    SafeUrlPipe
  ],
  templateUrl: './announcement-detail-page.component.html',
  styleUrls: ['./announcement-detail-page.component.scss']
})
export class AnnouncementDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private announcementService = inject(AnnouncementService);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  announcement: Announcement | null = null;
  isLoading = false;

  images: AnnouncementMedia[] = [];
  pdfs: AnnouncementMedia[] = [];
  jobVacancies: JobVacancy[] = [];
  selectedJobVacancy: JobVacancy | null = null;

  displayedColumns: string[] = ['jobTitle', 'jobCode', 'grade', 'workPlace', 'requiredNumber', 'action'];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAnnouncement(id);
      } else {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAnnouncement(id: string): void {
    console.log('Fetching announcement detail for ID:', id);
    setTimeout(() => {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      this.announcementService.getAnnouncementById(id)
        .pipe(finalize(() => {
          console.log('Announcement fetch finalized');
          this.isLoading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (announcement) => {
            console.log('Announcement detail received:', announcement);
            this.announcement = announcement;
            this.groupMedia();
            this.jobVacancies = announcement.jobVacancies || [];
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading announcement:', error);
            this.cdr.detectChanges();
          }
        });
    });
  }

  groupMedia(): void {
    if (this.announcement?.media) {
      this.images = this.announcement.media.filter(media => 
        media.fileType === 'Image'
      );
      this.pdfs = this.announcement.media.filter(media => 
        media.fileType === 'Pdf'
      );
    }
  }

  getFileUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${environment.apiUrl}/${cleanUrl}`;
  }

  openLightbox(media: AnnouncementMedia): void {
    this.dialog.open(ImageLightboxComponent, {
      data: {
        imageUrl: this.getFileUrl(media.fileUrl),
        title: this.announcement?.title || 'Image',
        fileName: media.fileName
      },
      panelClass: 'full-screen-dialog',
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100vh',
      width: '100vw'
    });
  }

  downloadFile(media: AnnouncementMedia): void {
    const link = document.createElement('a');
    link.href = this.getFileUrl(media.fileUrl);
    link.download = media.fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  showJobDetails(job: JobVacancy): void {
    this.selectedJobVacancy = job;
  }

  hideJobDetails(): void {
    this.selectedJobVacancy = null;
  }

  goBack(): void {
    this.location.back();
  }
}
