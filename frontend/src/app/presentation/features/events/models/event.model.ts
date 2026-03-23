// src/app/presentation/features/events/models/event.model.ts

/* -----------------------------
   Event Types
--------------------------------*/
export enum EventType {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual'
}

/* -----------------------------
   Event Status
--------------------------------*/
export enum EventStatus {
  DRAFT = 'Draft',
  SCHEDULED = 'Scheduled',
  ONGOING = 'Ongoing',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived'
}

/* -----------------------------
   Assignment Roles
--------------------------------*/
export const ASSIGNMENT_ROLES = {
  EXPERT: 'Expert',
  CAMERAMAN: 'Cameraman'
} as const;

export type AssignmentRole =
  typeof ASSIGNMENT_ROLES[keyof typeof ASSIGNMENT_ROLES];

/* -----------------------------
   Department
--------------------------------*/
export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* -----------------------------
   Event Category
--------------------------------*/
export interface EventCategory {
  id: number;
  name: string;
  description?: string;
}

/* -----------------------------
   User
--------------------------------*/
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId: string;
  employeeId: string;
}

/* =========================================================
   UPDATED ASSIGNMENT STRUCTURE (MATCHES BACKEND RESPONSE)
========================================================= */

/* -----------------------------
   Assignment User
--------------------------------*/
export interface AssignmentUser {
  id: string;
  name: string; // Backend sends direct name
  firstName?: string; // optional for compatibility
  lastName?: string; // optional for compatibility
  employeeId?: string;
}

/* -----------------------------
   Assignment
--------------------------------*/
export interface Assignment {
  id: string;
  name: string; // Backend sends name at root level
  employee?: AssignmentUser; // optional for backward compatibility
  assignedBy: AssignmentUser;
  status?: string;
  declineReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* -----------------------------
   Event Assignments
--------------------------------*/
export interface EventAssignments {
  cameraman?: Assignment[];
  expert?: Assignment[];
  photographer?: Assignment[];
  speaker?: Assignment[];
  organizer?: Assignment[];
  [key: string]: Assignment[] | undefined;
}

/* -----------------------------
   Assignment Payload
--------------------------------*/
export interface AssignmentPayload {
  employeeId: string;
  role: AssignmentRole;
}

/* -----------------------------
   Assignment API Request
--------------------------------*/
export interface AssignmentApiRequest {
  eventId: string;
  employeeId: string;
  role: string;
}

/* -----------------------------
   Assignment Response
--------------------------------*/
export interface AssignmentResponse {
  id: string;
  eventId: string;
  eventTitle: string;
  employee: User;
  assignedBy: User;
  status: string;
  role: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

/* -----------------------------
   Event Model
--------------------------------*/
export interface Event {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  eventPlace: string;
  status: EventStatus | string;
  timeStatus?: 'Past' | 'Ongoing' | 'Upcoming';
  createdAt?: string;
  updatedAt?: string;

  department: Department;
  createdBy: User;
  approvedBy?: User;

  assignments?: EventAssignments;
}

/* -----------------------------
   Create Event Request
--------------------------------*/
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

/* -----------------------------
   Event Form Data
--------------------------------*/
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