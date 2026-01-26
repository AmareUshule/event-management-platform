# EEP Event Management System (EEMS)

## Developer README

This document provides **developer-focused guidance** for setting up, understanding, and contributing to the EEP Event Management System based on the approved PRD.

---

## 1. System Overview

EEMS is a **single monolithic web application** that enables centralized event management, approval workflows, communication staff assignment, and media support storage for Ethiopian Electric Power (EEP).

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
| Frontend     | Angular (latest LTS)          |
| Backend      | ASP.NET Core Web API          |
| Database     | PostgreSQL                    |
| Auth         | Role + Department based RBAC  |
| Architecture | Single monolithic application |

---

## 3. Role & Authorization Logic (Critical)

Authorization is determined by **Role + Department**.

### Role Resolution Rules

```text
IF role == Admin
  → Full access

IF role == Manager AND department == Communication
  → Communication Manager permissions

IF role == Manager AND department != Communication
  → Department Manager permissions

IF role == Staff
  → Communication Expert / Camera Man permissions
```

> ⚠️ This logic must be enforced **both in the API (policies)** and **UI (guards)**.

---

## 4. Event Workflow (Backend-Enforced)

```text
Draft → Submitted → Approved → Scheduled → Ongoing → Completed → Archived
```

### Important Rules

* Events **cannot be approved** without assigning communication staff
* Approved events are **read-only** (except system status updates)
* Assignment and approval happen in a **single transaction**

---

## 5. Core Domain Models (Conceptual)

### User

* Id
* Name
* Email
* Role (Admin | Manager | Staff)
* Department
* IsActive

### Event

* Id
* Title
* Description
* EventCategory
* event_type ('PHYSICAL','VIRTUAL')
* location
* Department
* StartDate / EndDate
* Status
* CreatedBy

### Assignment

* Id
* EventId
* StaffUserId
* Status (Assigned | Accepted | Declined)
* DeclineReason (nullable)
* Timestamp

### Media

* Id
* EventId
* UploadedBy
* Type (Photo | Document | Link)
* FilePath / ExternalUrl
* Size
* CreatedAt

### AuditLog

* Id
* EntityType
* EntityId
* Action
* PerformedBy
* Timestamp

---

## 6. API Design Guidelines

### REST Principles

* Use RESTful endpoints
* Enforce authorization at controller/service level
* Validate role and department on every protected endpoint

### Example Endpoints

```
POST   /api/events
POST   /api/events/{id}/submit
POST   /api/events/{id}/approve
POST   /api/events/{id}/assignments
POST   /api/assignments/{id}/accept
POST   /api/assignments/{id}/decline
POST   /api/events/{id}/media
GET    /api/dashboard
```

---

## 7. Media Upload Rules

* Max file size: **5 MB**
* Allowed types:

  * Images
  * Documents
  * External links
* Only assigned staff or communication managers may upload/delete
* Backend must validate:

  * Assignment exists
  * Event status allows upload

---

## 8. Frontend Guidelines (Angular)

### Recommended Structure

```
/app
  /core        → auth, guards, services
  /shared     → reusable components
  /features
    /events
    /assignments
    /media
    /dashboard
```

### UI Rules

* Hide actions user cannot perform (do not rely only on backend errors)
* Display event status clearly
* Show assignment acceptance/decline actions only to assigned staff

---

## 9. Database Guidelines

* Use migrations for schema changes
* Enforce foreign keys
* Prefer soft-delete or archive for events
* Assignment and audit tables are **append-only**

---

## 10. Installation and Running the Project

### Prerequisites

* Node.js (LTS)
* npm
* .NET SDK (latest LTS)
* PostgreSQL

### Clone Repository

```bash
git clone git@github.com:AmareUshule/event-management-platform.git
cd event-management-platform
```

### Run Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will be available at:

```
http://localhost:4200
```

### Run Backend

```bash
cd backend
dotnet restore
dotnet run
```

The backend API will be available at:

```
https://localhost:5001
```

---

## 11. Environment Configuration

### Required Configuration (Example)

```
DB_CONNECTION_STRING=
JWT_SECRET=
FILE_STORAGE_PATH=
MAX_UPLOAD_SIZE_MB=5
```

---

## 11. Development Workflow

1. Create feature branch
2. Implement backend logic with policy checks
3. Implement frontend UI with guards
4. Add audit logging
5. Test role-based access
6. Create pull request

---

## 12. Testing Guidelines

* Unit test authorization rules
* Test approval + assignment atomicity
* Test media upload permission boundaries
* Verify dashboard data scoping

---

## 13. Reference Documents

* Product Requirements Document (PRD)
* System Architecture (to be added)
* ERD (to be added)

---

## Project Status

Design complete. Ready for:

* ERD design
* API contract definition
* Sprint planning

---

**EEP Event Management System (EEMS)**
Developer Documentation
