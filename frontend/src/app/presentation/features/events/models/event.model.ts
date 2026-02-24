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

export interface Event {
  id?: string;
  title: string;
  description: string;
  eventCategoryId: number;
  startDate: string; // ISO string format
  endDate: string;   // ISO string format
  eventType: EventType;
  location: string;
  departmentId: number;
  status: EventStatus;
  createdBy: number; // employeeId
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: number;
}

// Type guard to check if an object is a valid Event
export function isEvent(obj: any): obj is Event {
  return obj 
    && typeof obj.title === 'string'
    && typeof obj.eventCategoryId === 'number'
    && typeof obj.startDate === 'string'
    && typeof obj.endDate === 'string'
    && (obj.eventType === EventType.PHYSICAL || obj.eventType === EventType.VIRTUAL)
    && typeof obj.departmentId === 'number'
    && typeof obj.createdBy === 'number';
}