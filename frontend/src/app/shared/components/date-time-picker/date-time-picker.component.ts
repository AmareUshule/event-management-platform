import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface TimeOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ]
})
export class DateTimePickerComponent implements ControlValueAccessor, Validator {
  @Input() label = 'Date and time';
  @Input() icon = 'event';
  @Input() required = false;
  @Input() min: Date | null = null;
  @Input() errorText = 'Select both date and time';

  dateValue: Date | null = null;
  timeValue = '';
  disabled = false;
  touched = false;

  readonly timeOptions: TimeOption[] = this.createTimeOptions();

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  get previewText(): string {
    if (!this.dateValue && !this.timeValue) return 'Not scheduled';
    if (!this.dateValue) return `Time ${this.formatTimeLabel(this.timeValue)}`;
    if (!this.timeValue) return this.dateValue.toLocaleDateString();

    const combined = this.combineDateAndTime();
    return combined
      ? combined.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      : 'Not scheduled';
  }

  writeValue(value: Date | string | null): void {
    if (!value) {
      this.dateValue = null;
      this.timeValue = '';
      return;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      this.dateValue = null;
      this.timeValue = '';
      return;
    }

    this.dateValue = date;
    this.timeValue = this.formatTimeValue(date);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(_: AbstractControl): ValidationErrors | null {
    const value = this.combineDateAndTime();

    if (this.required && !value) {
      return { required: true };
    }

    if (value && this.min && value < this.min) {
      return { minDateTime: true };
    }

    return null;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.dateValue = event.value;
    this.emitValue();
  }

  onTimeChange(value: string): void {
    this.timeValue = value;
    this.emitValue();
  }

  clear(): void {
    if (this.disabled) return;

    this.dateValue = null;
    this.timeValue = '';
    this.emitValue();
  }

  markTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  private emitValue(): void {
    this.markTouched();
    this.onChange(this.combineDateAndTime());
  }

  private combineDateAndTime(): Date | null {
    if (!this.dateValue || !this.timeValue) return null;

    const [hours, minutes] = this.timeValue.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

    const combined = new Date(this.dateValue);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  private createTimeOptions(): TimeOption[] {
    const options: TimeOption[] = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value, label: this.formatTimeLabel(value) });
      }
    }

    return options;
  }

  private formatTimeValue(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatTimeLabel(value: string): string {
    if (!value) return '';

    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
}
