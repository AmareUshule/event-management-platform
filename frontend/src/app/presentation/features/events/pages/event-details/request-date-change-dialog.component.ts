import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface RequestDateChangeDialogData {
  eventTitle: string;
  currentStartDate: string;
  currentEndDate: string;
  currentEventPlace?: string;
  isDraft?: boolean;
}

@Component({
  selector: 'app-request-date-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isDraft ? 'Edit Date/Location' : 'Request Date/Location Change' }}</h2>
    <mat-dialog-content [formGroup]="form">
      <p>Modifying: <strong>{{ data.eventTitle }}</strong></p>
      
      <div class="current-info-grid">
        <mat-form-field appearance="outline" class="small-field">
          <mat-label>Current Start</mat-label>
          <input matInput [value]="data.currentStartDate | date:'medium'" readonly>
        </mat-form-field>
        <mat-form-field appearance="outline" class="small-field">
          <mat-label>Current End</mat-label>
          <input matInput [value]="data.currentEndDate | date:'medium'" readonly>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Proposed Start Date & Time</mat-label>
        <input matInput [matDatepicker]="startDatePicker" formControlName="proposedStartDate" readonly (click)="startDatePicker.open()">
        <mat-datepicker-toggle matSuffix [for]="startDatePicker"></mat-datepicker-toggle>
        <mat-datepicker #startDatePicker></mat-datepicker>
        <mat-error *ngIf="form.get('proposedStartDate')?.hasError('required')">Start Date is required</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Proposed End Date & Time</mat-label>
        <input matInput [matDatepicker]="endDatePicker" formControlName="proposedEndDate" readonly (click)="endDatePicker.open()">
        <mat-datepicker-toggle matSuffix [for]="endDatePicker"></mat-datepicker-toggle>
        <mat-datepicker #endDatePicker></mat-datepicker>
        <mat-error *ngIf="form.get('proposedEndDate')?.hasError('required')">End Date is required</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>New Location/Event Place</mat-label>
        <input matInput formControlName="proposedEventPlace" placeholder="Enter new location">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width" *ngIf="!data.isDraft">
        <mat-label>Reason for Change</mat-label>
        <textarea matInput formControlName="reason" rows="3" placeholder="Provide a justification for the change"></textarea>
        <mat-error *ngIf="form.get('reason')?.hasError('required')">Reason is required for scheduled events</mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">
        {{ data.isDraft ? 'Update Event' : 'Submit Request' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      .current-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .small-field {
        font-size: 12px;
      }
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 400px;
      }
    `,
  ],
})
export class RequestDateChangeDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RequestDateChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RequestDateChangeDialogData,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      proposedStartDate: [null, Validators.required],
      proposedEndDate: [null, Validators.required],
      proposedEventPlace: [data.currentEventPlace || ''],
      reason: [null],
    });

    if (!data.isDraft) {
      this.form.get('reason')?.setValidators([Validators.required]);
    }
  }

  ngOnInit(): void {
    // Initialize proposed dates with current dates for convenience
    this.form.patchValue({
      proposedStartDate: new Date(this.data.currentStartDate),
      proposedEndDate: new Date(this.data.currentEndDate)
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Please fill all required fields.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }
    const formValue = this.form.value;
    // Ensure dates are ISO strings
    formValue.proposedStartDate = formValue.proposedStartDate.toISOString();
    formValue.proposedEndDate = formValue.proposedEndDate.toISOString();
    this.dialogRef.close(formValue);
  }
}
