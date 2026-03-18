// src/app/presentation/features/events/pages/event-details/assignment-dialog.component.ts

import { Component, Inject, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EmployeeService } from '../../../../../core/services/employee.service';
import { Employee } from '../../../../../core/models/employee.model';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';

export interface DialogData {
  eventId: string;
  eventTitle: string;
  existingAssignments: Record<string, any[]>;
  availableRoles: string[];
}

// Add constants for roles to ensure consistency
const ASSIGNMENT_ROLES = {
  CAMERAMAN: 'cameraman',
  EXPERT: 'expert',
  PHOTOGRAPHER: 'photographer',
  SPEAKER: 'speaker',
  ORGANIZER: 'organizer'
};

@Component({
  selector: 'app-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './assignment-dialog.component.html',
  styleUrls: ['./assignment-dialog.component.scss']
})
export class AssignmentDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AssignmentDialogComponent>);
  public data = inject<DialogData>(MAT_DIALOG_DATA);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  assignmentForm: FormGroup;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = false;
  error: string | null = null;
  isSubmitting = false;
  maxAssignments = 5;
  
  availableRoles: string[] = [];
  roleColors: Record<string, string> = {
    'expert': '#7b1fa2',
    'cameraman': '#1976d2',
    'photographer': '#e91e63',
    'speaker': '#ff9800',
    'organizer': '#4caf50'
  };
  
  private destroy$ = new Subject<void>();
  private assignedEmployeeIds = new Set<string>();
  private isInitialized = false;

  constructor() {
    this.assignmentForm = this.fb.group({
      assignments: this.fb.array([])
    });

    this.availableRoles = this.data.availableRoles || ['cameraman', 'expert'];
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.buildAssignedEmployeeSet();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed property to check if any roles have available employees
  get noAvailableEmployeesForAnyRole(): boolean {
    if (!this.employees.length || !this.availableRoles.length) return false;
    return this.availableRoles.every(role => this.getAvailableCountForRole(role) === 0);
  }

  private buildAssignedEmployeeSet(): void {
    if (this.data.existingAssignments) {
      Object.values(this.data.existingAssignments).forEach(assignments => {
        if (Array.isArray(assignments)) {
          assignments.forEach(assignment => {
            if (assignment.employee) {
              if (assignment.employee.id) {
                this.assignedEmployeeIds.add(assignment.employee.id);
              }
              if (assignment.employee.employeeId) {
                this.assignedEmployeeIds.add(assignment.employee.employeeId);
              }
            }
          });
        }
      });
    }
  }

  get assignmentsArray(): FormArray {
    return this.assignmentForm.get('assignments') as FormArray;
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = null;

    this.employeeService.getAllEmployees()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading employees:', error);
          this.error = 'Failed to load employees. Please try again.';
          this.showError(this.error);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // Force change detection
        })
      )
      .subscribe(employees => {
        this.employees = employees;
        this.filteredEmployees = [];
        
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          if (this.employees.length > 0 && !this.isInitialized) {
            this.isInitialized = true;
            this.addAssignment();
          }
          this.cdr.detectChanges();
        });
      });
  }

  getFilteredEmployees(currentIndex: number, role?: string): Employee[] {
    if (!role) {
      console.log('No role selected for index', currentIndex);
      return [];
    }
    
    const selectedIds = new Set<string>();
    
    // Get all selected employee IDs from other rows
    this.assignmentsArray.controls.forEach((control, index) => {
      if (index !== currentIndex) {
        const id = control.get('employeeId')?.value;
        if (id) {
          selectedIds.add(id);
          const emp = this.getEmployeeById(id);
          if (emp?.employeeId) {
            selectedIds.add(emp.employeeId);
          }
        }
      }
    });

    // Filter employees by role AND not assigned to event
    const targetRole = role.trim().toLowerCase();
    const available = this.employees.filter(emp => {
      const empRole = (emp.role || '').trim().toLowerCase();
      const isMatch = empRole === targetRole;
      const isNotAssigned = !this.assignedEmployeeIds.has(emp.id) && 
                            !this.assignedEmployeeIds.has(emp.employeeId);
      
      return isMatch && isNotAssigned;
    });

    // Remove employees already selected in other rows
    const finalFiltered = available.filter(emp => !selectedIds.has(emp.id) && !selectedIds.has(emp.employeeId));
    
    console.log(`Filtering for role "${targetRole}": found ${available.length} available, ${finalFiltered.length} after excluding other selections`);
    
    return finalFiltered;
  }

  // Get employees by role (unassigned only)
  getEmployeesByRole(role: string): Employee[] {
    if (!role) return [];
    const targetRole = role.trim().toLowerCase();
    
    return this.employees.filter(emp => {
      const empRole = (emp.role || '').trim().toLowerCase();
      return empRole === targetRole && 
             !this.assignedEmployeeIds.has(emp.id) && 
             !this.assignedEmployeeIds.has(emp.employeeId);
    });
  }

  addAssignment(role?: string): void {
    if (this.assignmentsArray.length < this.maxAssignments) {
      const assignmentGroup = this.fb.group({
        employeeId: ['', Validators.required],
        role: [role || '', Validators.required]
      });

      // Reset employee selection when role changes
      assignmentGroup.get('role')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          assignmentGroup.patchValue({ employeeId: '' }, { emitEvent: false });
        });

      this.assignmentsArray.push(assignmentGroup);
      this.cdr.detectChanges(); // Force change detection after adding
    }
  }

  removeAssignment(index: number): void {
    this.assignmentsArray.removeAt(index);
    this.cdr.detectChanges(); // Force change detection after removing
  }

  onRoleChange(index: number): void {
    const control = this.assignmentsArray.at(index);
    control.get('employeeId')?.setValue('');
  }

  isMaxAssignmentsReached(): boolean {
    return this.assignmentsArray.length >= this.maxAssignments;
  }

  getRoleColor(role: string): string {
    if (!role) return '#2E7D32';
    return this.roleColors[role.toLowerCase()] || '#2E7D32';
  }

  formatRole(role: string): string {
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  getAvailableRolesForRow(index: number): string[] {
    return this.availableRoles;
  }

  hasAvailableEmployeesForRole(role: string): boolean {
    return this.getEmployeesByRole(role).length > 0;
  }

  getAvailableCountForRole(role: string): number {
    return this.getEmployeesByRole(role).length;
  }

  getAssignmentSummary(): string {
    const counts: Record<string, number> = {};
    this.assignmentsArray.controls.forEach(control => {
      const role = control.get('role')?.value;
      if (role) {
        counts[role] = (counts[role] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([role, count]) => `${this.formatRole(role)}: ${count}`)
      .join(' • ');
  }

  getEmployeeById(id: string): Employee | undefined {
    if (!id) return undefined;
    let employee = this.employees.find(emp => emp.id === id);
    if (!employee) {
      employee = this.employees.find(emp => emp.employeeId === id);
    }
    return employee;
  }

  getEmployeeDisplay(employee: Employee): string {
    if (!employee) return '';
    return `${employee.name || (employee.firstName + ' ' + employee.lastName)}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.markFormGroupTouched(this.assignmentForm);
      this.showError('Please fill in all required fields');
      return;
    }

    if (this.assignmentsArray.length === 0) {
      this.showError('Please add at least one assignment');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assignmentsArray.value;
    
    // Create payload with the correct ID format
    const payload = formValue.map((assignment: any) => {
      const employee = this.getEmployeeById(assignment.employeeId);
      
      // Use the string ID (employeeId) as expected by the assignments endpoint
      // Fallback to the provided ID if not found
      const employeeIdToSend = employee?.employeeId || assignment.employeeId;
      
      console.log('Mapping assignment:', {
        selectedEmployeeName: employee?.name,
        originalId: assignment.employeeId,
        sendingId: employeeIdToSend,
        role: assignment.role
      });
      
      return {
        employeeId: employeeIdToSend,
        role: this.capitalizeRole(assignment.role)
      };
    });
    
    console.log('Final payload being sent to service:', payload);
    this.dialogRef.close(payload);
  }

  // Helper method to capitalize role names
  private capitalizeRole(role: string): string {
    if (!role) return role;
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}