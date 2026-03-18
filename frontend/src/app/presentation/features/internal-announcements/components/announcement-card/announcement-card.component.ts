import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Announcement } from '../../models/announcement.model';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './announcement-card.component.html',
  styleUrls: ['./announcement-card.component.scss']
})
export class AnnouncementCardComponent {
  @Input() announcement!: Announcement;
  @Input() isDraft: boolean = false;
  @Input() isPending: boolean = false;
  @Input() isRejected: boolean = false;
  @Input() canManage: boolean = false;
  @Input() canPublish: boolean = false;
  @Input() canSubmit: boolean = false;

  @Output() edit = new EventEmitter<Announcement>();
  @Output() delete = new EventEmitter<Announcement>();
  @Output() publish = new EventEmitter<Announcement>();
  @Output() submitForApproval = new EventEmitter<Announcement>();
  @Output() reject = new EventEmitter<Announcement>();

  get bannerImage(): string | null {
    if (this.announcement.coverImageUrl) {
      return this.getFullImageUrl(this.announcement.coverImageUrl);
    }
    if (this.announcement.media && this.announcement.media.length > 0) {
      const firstImage = this.announcement.media.find(m => m.fileType === 'Image');
      if (firstImage) {
        return this.getFullImageUrl(firstImage.fileUrl);
      }
    }
    return null;
  }

  get isBannerAnImage(): boolean {
    // If there's a cover image, it's an image
    if (this.announcement.coverImageUrl) {
      return true;
    }
    // Otherwise, check if the first media is an image
    if (this.announcement.media && this.announcement.media.length > 0) {
      const firstImage = this.announcement.media.find(m => m.fileType === 'Image');
      return firstImage !== undefined;
    }
    return false;
  }

  getFullImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${environment.apiUrl}/${cleanUrl}`;
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.announcement);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.announcement);
  }

  onPublish(event: Event) {
    event.stopPropagation();
    this.publish.emit(this.announcement);
  }

  onSubmit(event: Event) {
    event.stopPropagation();
    this.submitForApproval.emit(this.announcement);
  }

  onReject(event: Event) {
    event.stopPropagation();
    this.reject.emit(this.announcement);
  }
}
