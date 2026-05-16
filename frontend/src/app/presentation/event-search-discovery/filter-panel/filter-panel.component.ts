import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

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
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss'
})
export class FilterPanelComponent {
  @Output() filtersChanged = new EventEmitter<FilterCriteria>();
  @Output() clearAllFilters = new EventEmitter<void>();

  // Dummy filter values for now - these would come from services/API in a real app
  categories = ['Conference', 'Workshop', 'Webinar', 'Meetup', 'Exhibition'];
  organizers = ['Tech Solutions Inc.', 'Global Events Ltd.', 'Community Hub'];
  departments = ['Marketing', 'Sales', 'HR', 'IT', 'Operations'];
  statuses = ['Planned', 'Active', 'Completed', 'Cancelled'];
  priorities = ['High', 'Medium', 'Low'];

  activeFilters: FilterCriteria = {};

  onFilterChange(type: keyof FilterCriteria, value: any) {
    this.activeFilters = { ...this.activeFilters, [type]: value };
    this.filtersChanged.emit(this.activeFilters);
  }

  onClearAll() {
    this.activeFilters = {};
    this.clearAllFilters.emit();
  }
}
