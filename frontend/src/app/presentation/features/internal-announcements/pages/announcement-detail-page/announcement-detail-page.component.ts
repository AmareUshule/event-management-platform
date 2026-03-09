import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnnouncementService } from '../../services/announcement.service';
import { Announcement } from '../../models/announcement.model';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-announcement-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
    HeaderComponent
  ],
  templateUrl: './announcement-detail-page.component.html',
  styleUrls: ['./announcement-detail-page.component.scss']
})
export class AnnouncementDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private announcementService = inject(AnnouncementService);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  announcement: Announcement | null = null;
  isLoading = false;

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
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading announcement:', error);
            this.cdr.detectChanges();
          }
        });
    });
  }

  getFullImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${environment.apiUrl}/${cleanUrl}`;
  }

  goBack(): void {
    this.location.back();
  }
}
