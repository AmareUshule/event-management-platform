// src/app/presentation/features/events/models/event.model.ts

export enum EventType {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual'
}

export enum EventStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed'
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventCategory {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId: string;
  employeeId: string;
}

// This is what the backend returns
export interface Event {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  eventPlace: string;
  status: EventStatus | string;
  createdAt?: string;
  updatedAt?: string;
  department: Department;
  createdBy: User;
  approvedBy?: User;
}

// This is what we send to the backend
export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  eventPlace: string;
  status: EventStatus | string;
  department: {
    id: string;
  };
  createdBy: {
    id: string;
    employeeId: string;
  };
}

// This is the form data structure
export interface EventFormData {
  title: string;
  description: string;
  eventCategoryId: number;
  startDateTime: Date | string;
  endDateTime: Date | string;
  eventType: EventType;
  address: string;
  meetingLink: string;
  departmentId: number;
}