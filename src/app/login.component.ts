import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  employeeId = '';
  password = '';

  onSubmit() {
    // Placeholder for actual EEP authentication
    alert(`Attempting sign in for Employee ID: ${this.employeeId}`);
  }
}
