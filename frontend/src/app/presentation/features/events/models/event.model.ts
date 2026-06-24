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
  COVERED = 'Covered',
  UNCOVERED = 'Uncovered'
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
   Assignment Statuses (Custom for UI)
--------------------------------*/
export enum AssignmentStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  SUBMITTED = 'Submitted',
  VERIFIED_BY_CREATOR = 'VerifiedByCreator',
  REVISION_REQUESTED = 'RevisionRequested',
  COVERED = 'Covered',
  UNCOVERED = 'Uncovered'
}

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
  name?: string;
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
  employeeId?: string;
  employee?: AssignmentUser; // optional for backward compatibility
  assignedBy: AssignmentUser;
  status?: string;
  commentHistory?: string;
  declineReason?: string;
  verificationNote?: string;
  verifiedAt?: string;
  verifiedBy?: AssignmentUser;
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
  verificationNote?: string;
  verifiedAt?: string;
  verifiedBy?: User;
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
  category: string;
  startDate: string;
  endDate: string;
  eventPlace: string;
  coverImageUrl?: string;
  status: EventStatus | string;
  timeStatus?: 'Past' | 'Ongoing' | 'Upcoming';
  createdAt?: string;
  updatedAt?: string;

  department: Department;
  createdBy: User;
  approvedBy?: User;
  finalizedBy?: User;
  closureComment?: string;
  cancellationRequestStatus?: 'None' | 'Pending' | 'Approved' | 'Rejected' | string;
  cancellationReason?: string;
  cancellationRequestedBy?: User;
  cancellationRequestedAt?: string;
  cancellationReviewedBy?: User;
  cancellationReviewedAt?: string;
  cancellationReviewComment?: string;
  
  dateChangeRequestStatus?: 'None' | 'Pending' | 'Approved' | 'Rejected' | string;
  proposedStartDate?: string;
  proposedEndDate?: string;
  proposedEventPlace?: string;
  dateChangeReason?: string;
  dateChangeRequestedBy?: User;
  dateChangeRequestedAt?: string;
  dateChangeReviewedBy?: User;
  dateChangeReviewedAt?: string;
  dateChangeReviewComment?: string;
  scheduleHistory?: string;

  hasSubmittedAssignments?: boolean;

  assignments?: EventAssignments;
}

/* -----------------------------
   Media Types
--------------------------------*/
export enum MediaType {
  IMAGE = 'Image',
  VIDEO = 'Video',
  DOCUMENT = 'Document',
  LINK = 'Link'
}

/* -----------------------------
   Media File
--------------------------------*/
export interface MediaFile {
  id: string;
  fileName: string;
  filePath: string;
  thumbnailPath?: string;
  fileType: MediaType;
  fileSize: number;
  eventId: string;
  createdAt: string;
  uploadedBy: string;
  uploaderName?: string;
  uploaderFirstName?: string;
  uploaderLastName?: string;
}

/* -----------------------------
   Create Event Request
--------------------------------*/
export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  eventPlace: string;
  coverImageUrl?: string;
  departmentId?: string;
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
  departmentId: number | string;
  coverImageUrl?: string;
}

/* -----------------------------
   Gallery DTO
--------------------------------*/
export interface GalleryMediaDto {
  mediaId: string;
  filePath: string;
  fileType: MediaType;
  eventId: string;
  eventTitle: string;
  eventDate: string;
}
