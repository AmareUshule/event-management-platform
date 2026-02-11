# EEP Event Management System (EEMS)

## Overview

The **EEP Event Management System (EEMS)** is a centralized web application designed for Ethiopian Electric Power (EEP) to manage events across all departments. The system streamlines event planning, approval, communication staff assignment, and media support storage while providing visibility, accountability, and reporting.

EEMS is built as a **single monolithic application** using **Angular**, **.NET (C#)**, and **PostgreSQL**.

---

## Key Objectives

- Centralize all EEP events into a single platform
- Enforce structured approval and assignment workflows
- Ensure proper media coverage and accountability
- Support event-related media uploads and documentation
- Provide dashboards and reports for management decision-making

---

## Core Features

### Event Management

- Create, edit, submit, approve, and archive events
- Full event lifecycle management:

  ```
  Draft → Submitted → Approved → Scheduled → Ongoing → Completed → Archived
  ```

- Events become read-only after approval

### Approval Workflow

- Events must be approved by **Admin** or **Communication Manager**
- Approval **must include assignment** of communication staff
- Events cannot be approved without assignment

### Assignment & Coverage

- Assign multiple communication experts and camera men from a **single unified staff list**
- Staff can accept or decline assignments
- Declines require a mandatory reason
- All assignment actions are stored as immutable history

### Media Support Storage

- Supported media:
  - Photos
  - Documents
  - External links

- Maximum upload size: **5 MB per file**
- Only assigned staff and communication managers can upload or delete media
- Unassigned staff cannot modify event media

### Dashboards & Reporting

- System-wide dashboard for Admin
- Department-level dashboards for managers
- Reports filterable by department, date, and status
- Export reports to PDF and Excel

### Notifications

- In-app and email notifications for:
  - Event assignment
  - Assignment acceptance or decline
  - Event approval or rejection
  - Event updates

### Audit & Logging

- Audit logging for:
  - Event changes
  - Assignments and reassignments
  - Media uploads and deletions

- Audit logs accessible only to Admin

---

## User Roles & Access Model

### Roles

| Role                              | Description                        |
| --------------------------------- | ---------------------------------- |
| **Admin**                         | Full system administrator          |
| **Manager (Communication Dept.)** | Communication Manager              |
| **Manager (Other Depts.)**        | Department Manager                 |
| **Staff**                         | Communication Experts & Camera Men |

### Role Determination Rule

A user is treated as a **Communication Manager** if:

```
Role = Manager AND Department = Communication
```

---

## Permissions Summary

| Action           | Admin | Comm. Manager | Dept. Manager | Staff             |
| ---------------- | ----- | ------------- | ------------- | ----------------- |
| Create event     | ✓     | ✓             | ✓             | ✗                 |
| Approve + assign | ✓     | ✓             | ✗             | ✗                 |
| Assign staff     | ✓     | ✓             | ✗             | ✗                 |
| Upload media     | ✗     | ✓             | ✗             | ✓ (assigned only) |
| View dashboards  | ✓     | ✓             | ✓ (own dept)  | ✗                 |

---

## Technology Stack

- **Frontend:** Angular
- **Backend:** C# (.NET Web API)
- **Database:** PostgreSQL
- **Architecture:** Single Monolithic Application

---

## Project Structure (High-Level)

```
/frontend   → Angular application
/backend    → .NET API (Controllers, Services, Policies)
/database   → PostgreSQL schemas and migrations
/docs       → PRD and related documentation
```

---

## Non-Functional Requirements

- Role-based access control (RBAC)
- Policy-based authorization
- Secure file handling
- Scalable for multiple departments
- Maintainable modular codebase

---

## Future Enhancements (Phase 2)

- Calendar integration (Google / Outlook)
- SMS notifications
- External stakeholder access
- Enhanced media archival features

---

## Documentation

- **Product Requirements Document (PRD)** – Defines full functional and non-functional requirements

---

## Status

This project is currently in the **design and specification phase**. Development will follow the finalized PRD.

---

**EEP Event Management System (EEMS)**
© Ethiopian Electric Power
