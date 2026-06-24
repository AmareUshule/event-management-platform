# EEP Event Management System (EEMS)

This document provides developer-focused guidance for setting up, understanding, and contributing to the EEP Event Management System.

---

## 1. System Overview

EEMS is a comprehensive web application that enables centralized event management, approval workflows, communication staff assignment, and media support storage for Ethiopian Electric Power (EEP).

### Key Features
*   **Role-Based Dashboards**: Tailored views for different user roles, providing relevant statistics and action items.
*   **Event Discovery**: A public catalog for all users to browse scheduled and active events across the organization.
*   **Media Gallery**: A visual gallery displaying all images and videos from public events.
*   **Approval Workflows**: Multi-step workflows for event creation, approval, cancellation, and staff assignment.
*   **User & Department Management**: Administrative control over users and organizational departments.

### High-Level Architecture

```
Angular (Frontend)
      ↓ REST API
.NET (C# Backend)
      ↓ ORM / Queries
PostgreSQL (Database)
```

---

## 2. Technology Stack

| Layer        | Technology                    |
| ------------ | ----------------------------- |
| Frontend     | Angular (with Nx Workspaces)  |
| Backend      | ASP.NET Core Web API          |
| Database     | PostgreSQL                    |
| Auth         | Role + Department based RBAC  |
| Architecture | Monolithic Application        |

---

## 3. Role & Authorization Logic (Critical)

Authorization is determined by a combination of a user's **Role** and, for Managers, their **Department**.

### Role Resolution Rules

```text
IF role == Admin
  → Full system access. Can view and manage all data across all departments.

IF role == Manager AND department == Communication (Communication Manager)
  → Global view access, similar to Admin. Can manage and approve events across all departments. Has exclusive access to the Staff Workload page.

IF role == Manager AND department != Communication (Department Manager)
  → Restricted access. View is limited to events within their own department. Can create and manage events for their department.

IF role == Staff (Expert / Cameraman)
  → Task-based access. View is primarily limited to events they are assigned to.

IF role == Employee
  → General access. Can view public event data on pages like the Discovery and Gallery.
```

> ⚠️ This logic is enforced **both in the API (policies)** and **UI (guards and component logic)**.

---

## 4. Event Workflow (Backend-Enforced)

The system enforces a strict lifecycle for events to ensure proper procedure.

```text
Draft → Scheduled → Ongoing → Completed → Covered/Uncovered -> Cancelled
```

### Important Rules

* Events cannot be approved without assigning communication staff.
* Approved events are read-only (except for status changes managed by the system).
* Assignment and approval workflows are handled via dedicated endpoints.

---

## 5. Core Domain Models (Conceptual)

The system revolves around several core data models. *This is a simplified representation.*

*   **User**: Represents an employee with a specific role and department.
*   **Event**: The central model, containing all details about a scheduled activity.
*   **Assignment**: Links a `User` (Staff) to an `Event` with a specific role.
*   **Media**: Represents a file (image, video, etc.) uploaded and associated with an `Event`.
*   **Department**: An organizational unit that users and events belong to.
*   **AuditLog**: Records significant actions taken by users for traceability.

---

## 6. API Design Guidelines

### REST Principles

* Use RESTful endpoints and standard HTTP verbs.
* Enforce authorization at the controller/handler level using policies and role checks.
* Validate all incoming data using FluentValidation.

### Example Endpoints

```
// Events
POST   /api/events
GET    /api/events/discovery
GET    /api/events/{id}

// Media
GET    /api/media/gallery
POST   /api/media/upload

// Approvals & Assignments
POST   /api/events/{id}/approve
POST   /api/events/{id}/assignments
```

---

## 7. Media Upload Rules

*   Max file size is configured via environment settings.
*   Allowed types include Images, Videos, Documents, and external links.
*   Only Admins or staff specifically assigned to an event may upload media.
*   Backend validates that the event status allows for media uploads.

---

## 8. Frontend Guidelines (Angular)

### Structure

The frontend is an [Nx](https://nx.dev/) workspace.
```
/app
  /core        → auth, guards, global services, interceptors
  /shared      → reusable components, pipes, directives
  /features    → distinct application features (e.g., events, dashboard)
    /events
    /dashboard
    /gallery
```

### UI Rules

*   **Hide actions the user cannot perform.** UI elements for unauthorized actions should be hidden with `*ngIf` based on role checks from `AuthService`. Do not rely solely on backend 403 errors.
*   Clearly display the status of all entities (Events, Assignments, etc.).
*   Use route guards (`canActivate`) to protect entire pages/features from unauthorized roles.

---

## 9. Database Guidelines

*   Use Entity Framework Core migrations for all schema changes.
*   Enforce foreign keys and relationships at the database level.
*   Critical data like Events should use a soft-delete or archive pattern where possible.

---

## 10. Installation and Running the Project

### Prerequisites

*   Node.js (LTS version)
*   npm or yarn
*   .NET SDK (latest LTS version)
*   PostgreSQL Server

### Clone Repository

```bash
git clone <your-repo-url>
cd event-management-platform
```

### Backend Setup

1.  **Configure `appsettings.json`**: In `backend/EEP.EventManagement.Api/`, update `appsettings.Development.json` with your PostgreSQL connection string and other required settings.
2.  **Apply Migrations**:
    ```bash
    cd backend/EEP.EventManagement.Api
    dotnet ef database update
    ```
3.  **Run the API**:
    ```bash
    # From the root directory
    dotnet run --project backend/EEP.EventManagement.Api
    ```
The backend API will be available at `http://localhost:8080` (or as configured).

### Frontend Setup

1.  **Install Dependencies**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Run the Application**:
    ```bash
    nx serve
    ```
The frontend will be available at `http://localhost:4200`.

---

## 11. Environment Configuration

The project requires environment variables for both frontend and backend.

### Backend (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=5432;Database=eep_events;User Id=postgres;Password=password;"
  },
  "JwtSettings": {
    "Secret": "YOUR_SUPER_SECRET_JWT_KEY_THAT_IS_LONG",
    "Issuer": "EEP.EventManagement.Api",
    "Audience": "EEP.EventManagement.Users"
  }
}
```

### Frontend (`frontend/src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080' // Your backend API URL
};
```

---
**EEP Event Management System (EEMS)**
Developer Documentation
