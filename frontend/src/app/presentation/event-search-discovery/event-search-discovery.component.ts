import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';

interface FilterCriteria {
  category?: string;
  organizer?: string;
  location?: string;
  department?: string;
  status?: string[];
  priority?: string[];
  dateRange?: { start: Date; end: Date };
  tags?: string[];
}

@Component({
  selector: 'app-event-search-discovery',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, FilterPanelComponent],
  templateUrl: './event-search-discovery.component.html',
  styleUrl: './event-search-discovery.component.scss'
})
export class EventSearchDiscoveryComponent {
  currentSearchTerm: string = '';
  currentFilters: FilterCriteria = {};

  onSearch(searchTerm: string) {
    this.currentSearchTerm = searchTerm;
    console.log('Search term received:', searchTerm);
    // Trigger search logic with this.currentSearchTerm and this.currentFilters
  }

  onFiltersChanged(filters: FilterCriteria) {
    this.currentFilters = filters;
    console.log('Filters changed:', filters);
    // Trigger search logic with this.currentSearchTerm and this.currentFilters
  }

  onClearAllFilters() {
    this.currentFilters = {};
    console.log('All filters cleared.');
    // Optionally, re-run search with only the current search term
  }
}
