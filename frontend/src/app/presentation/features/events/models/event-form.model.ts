// event-form.model.ts //UI / Form
 
import { EventType } from './event.enums';

export interface EventFormData {
  title: string;
  description?: string;

  eventCategoryId: number;

  startDateTime: Date;
  endDateTime: Date;

  eventType: EventType;

  address?: string;      // physical UI field
  meetingLink?: string; // virtual UI field

  departmentId: number;
}
