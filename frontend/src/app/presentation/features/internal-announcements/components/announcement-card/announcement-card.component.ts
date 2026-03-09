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
  @Input() canManage: boolean = false;
  @Input() canPublish: boolean = false;

  @Output() edit = new EventEmitter<Announcement>();
  @Output() delete = new EventEmitter<Announcement>();
  @Output() publish = new EventEmitter<Announcement>();

  get bannerImage(): string | null {
    if (this.announcement.images && this.announcement.images.length > 0) {
      return this.announcement.images[0].imageUrl;
    }
    return null;
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
}
