# EEP Event Management & Announcement System (EEMS) - PRD

## 1. Executive Summary
The **EEP Event Management System (EEMS)** is a centralized digital platform for Ethiopian Electric Power (EEP) designed to streamline event coordination, internal communications, and media coverage tracking. It replaces manual processes (like Telegram-based vacancy conversions) with an integrated workflow for event planning, official announcements, and professional media storage.

---

## 2. User Roles & Access Model (RBAC)

### 2.1 Role Definitions
| Role | Description |
| :--- | :--- |
| **Admin** | Full system access, audit logs, user management, and global configuration. |
| **Communication Manager** | Responsible for approving events, assigning media staff, and publishing internal announcements. (Role = `Manager` AND Dept = `Communication`) |
| **Department Manager** | Creates event requests for their specific department and manages their own department's announcements. |
| **Staff (Expert/Cameraman)**| Communication team members assigned to cover events. Can upload media and manage assignments. |
| **Employee** | Standard users who can view published events and announcements. |

### 2.2 Permissions Matrix
| Action | Admin | Comm. Manager | Dept. Manager | Staff | Employee |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Create Event** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Approve/Assign Event** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Upload Event Media** | ✓ | ✓ | ✗ | ✓ (if assigned) | ✗ |
| **Create Announcement** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Publish Announcement** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **View Audit Logs** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **View Statistics** | ✓ | ✓ | ✓ (Own Dept) | ✗ | ✗ |

---

## 3. Core Modules

### 3.1 Event Management
- **Lifecycle**: `Draft` → `Submitted` → `Approved` → `Scheduled` → `Ongoing` → `Completed` → `Archived`.
- **Approval Workflow**: Events must be approved by the Communication team. Approval requires the assignment of at least one Cameraman or Expert.
- **Assignment System**: Assigned staff receive notifications and must `Accept` or `Decline` (with reason) the assignment.

### 3.2 Internal Announcements
The system supports three distinct announcement types to match organizational workflows:
1.  **General**: Standard notices, maintenance alerts, and internal meetings. Requires text content and optional cover image.
2.  **Job Opening**: Digital vacancy circulars. Supports **multiple job vacancies** within a single announcement. Each vacancy tracks Job Code, Grade, Work Place, and Requirements.
3.  **Document Post**: Specifically designed to replace manual Telegram conversion. Allows managers to upload **PDFs** or **Multiple Images** directly.

### 3.3 Media & Document Handling
- **Image Gallery**: Automatic gallery view for all uploaded images within an announcement or event.
- **Embedded PDF Viewer**: Direct on-page viewing of PDF documents (800px height) without requiring downloads or new tabs.
- **Support Formats**: `.jpg`, `.jpeg`, `.png`, `.webp`, and `.pdf`.
- **Sequential Uploads**: Robust multi-file upload handling during the creation and editing phases.

### 3.4 Dashboard & Reporting
- **Real-time Stats**: Track total events, pending approvals, and scheduled activities.
- **Insights**: Automatic alerts for upcoming events and pending assignments.
- **Exporting**: Export system data to Excel/PDF for management reporting (Admin/Manager only).

---

## 4. Key Workflows

### 4.1 The "Telegram-Free" Vacancy Workflow
1.  Manager receives a PDF vacancy list.
2.  Manager creates a **Document Post** announcement.
3.  Manager uploads the PDF directly to the system.
4.  Communication team reviews and publishes.
5.  Employees view the vacancy using the **Embedded PDF Viewer** on the platform.

### 4.2 Event Coverage Workflow
1.  Dept Manager creates an event.
2.  Comm Manager approves and assigns a Cameraman.
3.  Cameraman accepts via their "My Assignments" tab.
4.  After the event, Cameraman uploads photos/videos to the event's media section.

---

## 5. Technical Stack
- **Frontend**: Angular 17+ (Standalone Components, Material Design, Tailwind CSS).
- **Backend**: .NET 8 Web API (MediatR, AutoMapper, EF Core).
- **Database**: PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens) with secure HTTP-only storage considerations.
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API).

---

## 6. Non-Functional Requirements
- **Performance**: Announcement grids use optimized `minmax` layouts for 3-column rendering on desktops.
- **Security**: Policy-based authorization ensures users only see what they are allowed to (e.g., Creators see "My Pending", Managers see "Approval Queue").
- **Stability**: Fixed SSR layout shifts and compressed rendering issues via `AfterViewInit` and `NgZone` optimizations.
- **Responsiveness**: Fully responsive UI supporting mobile, tablet, and desktop views.

---
© 2026 Ethiopian Electric Power (EEP) - Internal Document
