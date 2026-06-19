import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { ReportService, StaffWorkload, StaffEventSummary } from '../../../../../core/services/report.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { EmployeeService } from '../../../../../core/services/employee.service';
import { Employee } from '../../../../../core/models/employee.model';
import { WorkloadCardComponent } from '../../components/workload-card/workload-card.component';

@Component({
  selector: 'app-staff-workload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    WorkloadCardComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule
  ],
  // Use the workload card standalone component
  // Importing here ensures the component is available in the template
  providers: [],
  // Import workload card component
  // (component is standalone so it can be used directly in template imports)
  templateUrl: './staff-workload.component.html',
  styleUrls: ['./staff-workload.component.scss']
})
export class StaffWorkloadComponent implements OnInit {
  private reportService = inject(ReportService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  staffWorkload: StaffWorkload[] = [];
  filteredWorkload: StaffWorkload[] = [];
  allStaff: Employee[] = [];
  
  // Filters & Sorting
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedRole = '';
  selectedStaffId = '';
  sortBy: 'name' | 'assignments' | 'active' = 'assignments';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  roles = [
    { value: '', label: 'All Roles' },
    { value: 'Expert', label: 'Experts Only' },
    { value: 'Cameraman', label: 'Cameramen Only' }
  ];

  ngOnInit(): void {
    if (!this.authService.isAdmin() && !this.authService.isCommunicationManager()) {
      this.snackBar.open('Unauthorized access', 'Close', { duration: 3000 });
      return;
    }
    this.loadStaffList();
    this.loadWorkload();
  }

  loadStaffList(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        // Filter only experts and cameramen for the dropdown
        this.allStaff = employees
          .filter(e => e.role === 'Expert' || e.role === 'Cameraman')
          .sort((a, b) => a.firstName.localeCompare(b.firstName));
        this.cdr.detectChanges();
      }
    });
  }

  loadWorkload(): void {
    this.isLoading = true;
    
    const params = {
      startDate: this.startDate?.toISOString(),
      endDate: this.endDate?.toISOString(),
      role: this.selectedRole || undefined,
      staffId: this.selectedStaffId || undefined
    };

    this.reportService.getStaffWorkload(params)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.staffWorkload = data;
          this.applySorting();
        },
        error: () => {
          this.snackBar.open('Failed to load workload data', 'Close', { duration: 3000 });
        }
      });
  }

  applyFilters(): void {
    this.loadWorkload();
  }

  applySorting(): void {
    const sorted = [...this.staffWorkload].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'assignments':
          comparison = a.totalAssignments - b.totalAssignments;
          break;
        case 'active':
          comparison = a.scheduledAssignments - b.scheduledAssignments;
          break;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
    this.filteredWorkload = sorted;
    this.cdr.detectChanges();
  }

  toggleSort(field: 'name' | 'assignments' | 'active'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applySorting();
  }

  resetFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.selectedRole = '';
    this.selectedStaffId = '';
    this.sortBy = 'assignments';
    this.sortOrder = 'desc';
    this.loadWorkload();
  }

  exportData(): void {
    this.reportService.exportReportSummary();
    this.snackBar.open('Exporting report...', 'Close', { duration: 2000 });
  }

  getTotalStaff(): number {
    return this.staffWorkload.length;
  }

  getTotalAssignments(): number {
    return this.staffWorkload.reduce((sum, staff) => sum + staff.totalAssignments, 0);
  }

  getActiveAssignments(): number {
    return this.staffWorkload.reduce((sum, staff) => sum + staff.scheduledAssignments, 0);
  }

  getPastAssignments(): number {
    return this.staffWorkload.reduce((sum, staff) => sum + staff.pastAssignments, 0);
  }

  getAverageAssignments(): string {
    if (!this.staffWorkload.length) return '0.0';
    return (this.getTotalAssignments() / this.staffWorkload.length).toFixed(1);
  }

  getBusyStaffCount(): number {
    return this.staffWorkload.filter((staff) => staff.scheduledAssignments >= 3 || staff.totalAssignments >= 4).length;
  }

  getAvailableStaffCount(): number {
    return this.staffWorkload.filter((staff) => staff.scheduledAssignments <= 1 && staff.totalAssignments <= 2).length;
  }

  getCurrentPeriodLabel(): string {
    if (this.startDate && this.endDate) {
      return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
    }

    if (this.startDate) return `From ${this.startDate.toLocaleDateString()}`;
    if (this.endDate) return `Until ${this.endDate.toLocaleDateString()}`;
    return 'All scheduled assignments';
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvailabilityStatus(staff: StaffWorkload): string {
    const assignments = staff.scheduledAssignments || staff.totalAssignments;
    if (assignments >= 4) return 'overloaded';
    if (assignments >= 3) return 'busy';
    if (assignments >= 2) return 'moderate';
    return 'available';
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'expert': return 'expert';
      case 'cameraman': return 'cameraman';
      default: return 'staff';
    }
  }

  /* utilization removed */

  getRecentEvents(events: StaffEventSummary[]): StaffEventSummary[] {
    return events.slice(0, 3);
  }

  private expandedStaff = new Set<string>();

  toggleExpandedView(staff: StaffWorkload): void {
    const staffId = staff.staffId;
    if (this.expandedStaff.has(staffId)) {
      this.expandedStaff.delete(staffId);
    } else {
      this.expandedStaff.add(staffId);
    }
  }

  isExpanded(staff: StaffWorkload): boolean {
    return this.expandedStaff.has(staff.staffId);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
      case 'Ongoing':
      case 'Completed':
      case 'Covered':
        return 'status-published';
      case 'Draft':
        return 'status-draft';
      case 'Concluded':
        return 'status-concluded';
      case 'Cancelled':
      case 'Rejected':
      case 'Uncovered':
        return 'status-rejected';
      default:
        return status.toLowerCase();
    }
  }
}
