// src/app/core/models/employee.model.ts
export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId: string;
  employeeId: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed field for display
  email: string;
  employeeId: string;
  departmentId: string;
  role: string;
}