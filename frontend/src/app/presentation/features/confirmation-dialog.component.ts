import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
  <div class="dialog-container">

      <div class="icon-wrapper" [ngClass]="data.color || 'primary'">
        <mat-icon>{{ data.icon || 'help_outline' }}</mat-icon>
      </div>

      <h2 class="dialog-title">{{ data.title }}</h2>

      <p class="dialog-message">
        {{ data.message }}
      </p>

      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>

        <button
          mat-raised-button
          [color]="data.color || 'primary'"
          (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>

  </div>
  `,
styles: [`
.dialog-container{
    text-align:center;
    padding:26px 20px 18px;
    max-width:420px;
}

/* ICON */
.icon-wrapper{
    width:70px;
    height:70px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    margin:0 auto 20px auto;
    box-shadow:0 4px 10px rgba(0,0,0,0.08);
}

/* EEP Primary Green */
.icon-wrapper.primary{
    background:#E8F5E9;
    color:#1B5E20;
}

/* Accent */
.icon-wrapper.accent{
    background:#F1F8E9;
    color:#33691E;
}

/* Warning / Delete */
.icon-wrapper.warn{
    background:#FDECEA;
    color:#B71C1C;
}

.icon-wrapper mat-icon{
    font-size:36px;
    font-weight:bold;
}

/* TITLE */
.dialog-title{
    font-size:22px;
    font-weight:700;
    margin-bottom:12px;
    color:#1B5E20;
    letter-spacing:0.3px;
}

/* MESSAGE */
.dialog-message{
    color:#4b5563;
    font-size:15px;
    margin-bottom:30px;
    line-height:1.7;
    font-weight:500;
}

/* ACTIONS */
.dialog-actions{
    display:flex;
    justify-content:center;
    gap:14px;
}

/* BUTTONS */
button{
    min-width:120px;
    font-weight:600;
    font-size:14px;
    border-radius:6px;
}

/* Cancel Button */
button[mat-stroked-button]{
    border:2px solid #1B5E20;
    color:#1B5E20;
}

/* Confirm Primary */
button[mat-raised-button][color="primary"]{
    background:#1B5E20;
    color:white;
    box-shadow:0 3px 8px rgba(27,94,32,0.25);
}

/* Confirm Warning */
button[mat-raised-button][color="warn"]{
    background:#B71C1C;
    color:white;
    box-shadow:0 3px 8px rgba(183,28,28,0.25);
}

/* Hover Effects */
button[mat-raised-button][color="primary"]:hover{
    background:#144d1a;
}

button[mat-raised-button][color="warn"]:hover{
    background:#8f1414;
}
`]
})
export class ConfirmationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  /* ---------- Helper method to open dialog ---------- */
  static open(dialog: MatDialog, data: ConfirmationDialogData): Observable<boolean> {
    return dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data
    }).afterClosed();
  }
}