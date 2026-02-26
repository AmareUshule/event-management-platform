// event-detail-page.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './event-detail-page.component.html',
  styleUrls: ['./event-detail-page.component.scss']
})
export class EventDetailPageComponent implements OnInit {

  event: Event | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');

    // Check if event was passed via router state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { event?: Event };

    if (state?.event) {
      // Use setTimeout to prevent ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.event = state.event;
        this.loading = false;
        this.cdr.detectChanges();
      });
    } else if (eventId) {
      this.fetchEventDetails(eventId);
    } else {
      this.loading = false;
      this.showError('Event not found');
      this.cdr.detectChanges();
    }
  }

  fetchEventDetails(id: string): void {
    this.loading = true;
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showError('Failed to load event details');
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  editEvent(): void {
    if (!this.event) return;
    this.router.navigate(['/events/edit', this.event.id]);
  }

  downloadICS(): void {
    if (!this.event) return;
    this.generateICS();
  }

  private generateICS(): void {
    const event = this.event!;
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Event Management//EN
BEGIN:VEVENT
UID:${event.id}@eventmanagement.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
LOCATION:${event.eventPlace}
DESCRIPTION:${event.description || 'Event details'}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title}.ics`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  shareEvent(): void {
    if (!this.event) return;

    if (navigator.share) {
      navigator.share({
        title: this.event.title,
        text: this.event.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000
      });
    }
  }

  openInMaps(): void {
    if (!this.event?.eventPlace) return;
    const url = `https://maps.google.com/?q=${encodeURIComponent(this.event.eventPlace)}`;
    window.open(url, '_blank');
  }

  getDirections(): void {
    this.openInMaps();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}