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

import { ReportService, StaffWorkload } from '../../../../../core/services/report.service';
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
    MatTooltipModule,
    HeaderComponent
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
