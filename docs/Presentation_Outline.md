# EEP Event Management System (EEMS) - Presentation Outline

This document provides a structured outline for a presentation on the EEMS project. The content is formatted to be easily copied into AI presentation generation tools (like Gamma, Tome, etc.) or used as a script for creating slides manually in PowerPoint.

---

### **Slide 1: Title Slide**

*   **Title:** EEP Event Management System (EEMS)
*   **Subtitle:** A Digital Platform for Centralized Event & Communication Management
*   **Presenters:** Amare Ushule, Solomon Ferede
*   **Logo:** [EEP Logo]

---

### **Slide 2: The Problem: Manual & Decentralized Processes**

*   **Inefficient Coordination:** Event planning and staff assignment were handled through manual requests and disparate communication channels.
*   **Insecure Communications:** Official announcements, like job vacancies, were distributed using non-official and insecure platforms like Telegram.
*   **No Central Record:** No single source of truth for event history, status, or associated media (photos/videos).
*   **Lack of Oversight:** Difficult for management to track staff workload, event coverage, and overall operational status.

---

### **Slide 3: The Solution: The EEMS Platform**

*   **A Single, Integrated Platform:** EEMS is a web application that provides an end-to-end solution for the entire event and announcement lifecycle.
*   **Role-Based & Secure:** Every user has a specific role, and the system ensures they only see the data and actions relevant to them.
*   **Centralized & Transparent:** Creates a single source of truth for all events, assignments, media, and announcements.
*   **Modern & Scalable:** Built on a robust and modern technology stack designed for security and future growth.

---

### **Slide 4: Core Feature: Role-Based Dashboards**

*   **A Tailored Experience for Every User:** The dashboard is the first thing a user sees and is customized to their role.
*   **For Admins & Communication Managers:** A global overview of all system activity, including events pending approval and overall system statistics.
*   **For Department Managers:** A focused view of their own department's events and announcements.
*   **For Staff (Experts/Cameramen):** A task-oriented view showing their upcoming assignments, pending invitations, and events requiring media uploads.

---

### **Slide 5: Core Feature: End-to-End Event Lifecycle Management**

*   **Digital Creation & Approval:** Managers can create detailed event requests, which are then routed to Communication Managers for a formal approval and assignment workflow.
*   **Automated Status Tracking:** The system automatically tracks the event status from `Draft` → `Scheduled` → `Ongoing` → `Completed` → `Covered`.
*   **Integrated Staff Assignments:** Communication Managers can assign staff directly within the event. Staff are notified and can accept or decline assignments.
*   **Secure Media Uploads:** Once an event is complete, assigned staff can upload photos and videos directly to the event, creating a permanent record.

---

### **Slide 6: Core Feature: Discovery & Media Gallery**

*   **Event Discovery Page:**
    *   Accessible to **all** employees.
    *   A public catalog to browse, search, and filter all scheduled and active events across the organization.
    *   Promotes transparency and awareness of company activities.
*   **Media Gallery Page:**
    *   Also accessible to **all** employees.
    *   A visual library of all images and videos from completed public events.
    *   Provides a centralized, easy-to-access repository of the company's visual assets.

---

### **Slide 7: Core Feature: Secure Internal Announcements**

*   **Replaces Manual Processes:** Fully digitizes the process for creating and publishing internal news.
*   **Supports Multiple Formats:**
    *   **General Notices:** For standard company updates.
    *   **Job Openings:** A structured format for posting vacancies.
    *   **Document Posts:** Allows for direct uploading and viewing of official PDF documents within the platform, eliminating the need for external tools.

---

### **Slide 8: User Roles & Permissions**

*   **Admin:** Full "god-mode" access. Can manage users, departments, and all data across the entire system.
*   **Communication Manager:** A global manager. Can see and manage all events and announcements from all departments. The only role besides Admin that can access the "Workload" page.
*   **Department Manager:** A restricted manager. Can only create and see events and announcements for their own department.
*   **Staff (Expert/Cameraman):** A task-based user. Can only see events they are assigned to and upload media to those specific events.
*   **Employee:** A general user. Has read-only access to public-facing pages like the Event Discovery and Media Gallery.

---

### **Slide 9: Technical Architecture**

*   A simple diagram showing the three main tiers: **Frontend ↔ Backend ↔ Database**.
*   **Frontend:**
    *   **Framework:** Angular (with Nx Workspace)
    *   **UI:** Angular Material
    *   **Description:** A modern, responsive single-page application (SPA).
*   **Backend:**
    *   **Framework:** ASP.NET Core Web API
    *   **Architecture:** Follows Clean Architecture principles (API, Application, Domain, Infrastructure).
    *   **Features:** Uses MediatR for CQRS pattern and EF Core for data access.
*   **Database:**
    *   **System:** PostgreSQL
    *   **Authentication:** Integrates with ASP.NET Core Identity for secure user and role management.

---

### **Slide 10: Conclusion & Next Steps**

*   **Project Success:** The EEMS platform successfully digitizes and centralizes critical workflows, improving efficiency, security, and institutional memory.
*   **Key Wins:**
    *   Replaced insecure manual processes.
    *   Established a secure, role-based system for data access.
    *   Created a single source of truth for all event-related activities and media.
*   **Future Work:**
    *   Further enhancements to reporting and analytics.
    *   Mobile application development.
    *   Integration with other internal EEP systems.
*   **Q&A**

---
