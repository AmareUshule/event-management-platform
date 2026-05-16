import { Component, OnInit, inject, signal, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

import { EventService } from '../../../presentation/features/events/services/event.service';
import { Event } from '../../../presentation/features/events/models/event.model';
import { HighlightPipe } from '../../pipes/highlight.pipe';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './search-overlay.component.html',
  styleUrls: ['./search-overlay.component.scss']
})
export class SearchOverlayComponent implements OnInit {
  private eventService = inject(EventService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();

  searchQuery = signal<string>('');
  results = signal<Event[]>([]);
  isLoading = signal<boolean>(false);
  
  recentSearches = ['Project Launch', 'Board Meeting', 'Workshop'];
  trendingEvents = signal<Event[]>([]);

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) return of([]);
        this.isLoading.set(true);
        return this.eventService.getAllEvents().pipe(
          finalize(() => this.isLoading.set(false))
        );
      })
    ).subscribe(allEvents => {
      const query = this.searchQuery().toLowerCase();
      const filtered = allEvents.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.description.toLowerCase().includes(query)
      ).slice(0, 5);
      this.results.set(filtered);
    });

    this.loadTrending();
  }

  loadTrending(): void {
    this.eventService.getUpcomingEvents().subscribe(events => {
      this.trendingEvents.set(events.slice(0, 3));
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectResult(event: Event): void {
    this.router.navigate(['/events', event.id]);
    this.closeOverlay();
  }

  closeOverlay(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeOverlay();
  }
}
