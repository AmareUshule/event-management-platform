export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: string; // 'Draft' | 'PendingApproval' | 'Rejected' | 'Published'
  type: string; // 'General' | 'JobOpening'
  deadline?: string;
  requirements?: string;
  experience?: string;
  training?: string;
  certificate?: string;
  requiredNumber?: number;
  otherOptionalRequirements?: string;
  grade?: string;
  workPlace?: string;
  jobCode?: string;
  department?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    employeeId: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    employeeId: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  images: AnnouncementImage[];
}

export interface AnnouncementImage {
  id: string;
  imageUrl: string;
  fileName: string;
  contentType: string;
  uploadedAt: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: string;
  deadline?: string;
  departmentId?: string;
  requirements?: string;
  experience?: string;
  training?: string;
  certificate?: string;
  requiredNumber?: number;
  otherOptionalRequirements?: string;
  grade?: string;
  workPlace?: string;
  jobCode?: string;
  image?: File;
}

export interface UpdateAnnouncementDto {
  title: string;
  content: string;
  type: string;
  deadline?: string;
  departmentId?: string;
  requirements?: string;
  experience?: string;
  training?: string;
  certificate?: string;
  requiredNumber?: number;
  otherOptionalRequirements?: string;
  grade?: string;
  workPlace?: string;
  jobCode?: string;
  image?: File;
}
