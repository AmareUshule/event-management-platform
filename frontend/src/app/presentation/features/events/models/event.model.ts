// event.model.ts//System / API Model
import { EventType, EventStatus } from './event.enums';

export interface Event {
  eventId?: number;

  title: string;
  description?: string;

  eventCategoryId: number;

  startDate: string;   // ISO date string from API
  endDate: string;

  eventType: EventType;

  location?: string;  // physical address OR meeting link

  createdBy?: number;
  approvedBy?: number;

  status?: EventStatus;

  departmentId: number;

  createdAt?: string;
  updatedAt?: string;
  updatedBy?: number;
}
