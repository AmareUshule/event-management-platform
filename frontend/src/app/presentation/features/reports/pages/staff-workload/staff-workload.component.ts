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
import { HeaderComponent } from '../../../../layouts/header/header.component';

@Component({
  selector: 'app-staff-workload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
  allStaff: Employee[] = [];
  
  // Filters
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedRole: string = '';
  selectedStaffId: string = '';
  
  roles = [
    { value: '', label: 'All Staff' },
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
        this.allStaff = employees.filter(e => e.role === 'Expert' || e.role === 'Cameraman');
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
        },
        error: (err) => {
          this.snackBar.open('Failed to load workload data', 'Close', { duration: 3000 });
        }
      });
  }

  applyFilters(): void {
    this.loadWorkload();
  }

  resetFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.selectedRole = '';
    this.selectedStaffId = '';
    this.loadWorkload();
  }

  getTotalStaff(): number {
    return this.staffWorkload.length;
  }

  getTotalAssignments(): number {
    return this.staffWorkload.reduce((sum, staff) => sum + staff.totalAssignments, 0);
  }

  getUtilizationRate(): number {
    if (this.staffWorkload.length === 0) return 0;
    const totalUtilization = this.staffWorkload.reduce((sum, staff) => sum + this.getUtilizationPercentage(staff), 0);
    return Math.round(totalUtilization / this.staffWorkload.length);
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvailabilityStatus(staff: StaffWorkload): string {
    const utilization = this.getUtilizationPercentage(staff);
    if (utilization >= 80) return 'overloaded';
    if (utilization >= 60) return 'busy';
    if (utilization >= 30) return 'moderate';
    return 'available';
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'expert': return 'expert';
      case 'cameraman': return 'cameraman';
      default: return 'staff';
    }
  }

  getUtilizationPercentage(staff: StaffWorkload): number {
    // Assuming a baseline of 5 assignments per month as 100% utilization
    const baseline = 5;
    const utilization = (staff.totalAssignments / baseline) * 100;
    return Math.min(Math.round(utilization), 100);
  }

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
        return 'status-published';
      case 'Draft':
        return 'status-draft';
      case 'Archived':
        return 'status-archived';
      case 'Cancelled':
      case 'Rejected':
        return 'status-rejected';
      default:
        return status.toLowerCase();
    }
  }
}