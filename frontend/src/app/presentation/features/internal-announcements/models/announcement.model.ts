export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: string; // 'Draft' | 'PendingApproval' | 'Rejected' | 'Published'
  type: string; // 'General' | 'JobOpening' | 'DocumentPost'
  deadline?: string;
  coverImageUrl?: string;
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
  media: AnnouncementMedia[];
  jobVacancies: JobVacancy[];
}

export interface AnnouncementMedia {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string; // 'Image' | 'Pdf'
  contentType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface JobVacancy {
  id: string;
  announcementId: string;
  jobTitle: string;
  jobCode: string;
  grade: string;
  requiredNumber: number;
  workPlace: string;
  requirements: string;
  experience: string;
  training: string;
  certificate: string;
  otherOptionalRequirements: string;
  workUnit: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  type: string;
  deadline?: string;
  departmentId?: string;
  coverImageUrl?: string;
  jobVacancies?: CreateJobVacancyDto[];
}

export interface UpdateAnnouncementDto {
  title: string;
  content: string;
  type: string;
  deadline?: string;
  departmentId?: string;
  coverImageUrl?: string;
  jobVacancies?: CreateJobVacancyDto[];
}

export interface CreateJobVacancyDto {
  jobTitle: string;
  jobCode: string;
  grade: string;
  requiredNumber: number;
  workPlace: string;
  requirements: string;
  experience: string;
  training: string;
  certificate: string;
  otherOptionalRequirements: string;
  workUnit: string;
}
