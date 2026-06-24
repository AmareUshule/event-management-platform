# EEMS Frontend Application

This document provides developer-focused guidance for the Angular frontend of the EEP Event Management System (EEMS).

---

## 1. Overview

This is an Angular 19+ application built using the [Nx](https://nx.dev/) workspace toolkit. It serves as the user interface for the EEMS platform, communicating with the backend via a REST API. It uses Angular Material for UI components and implements a role-based access control system to provide tailored experiences for different users.

---

## 2. Running the Application

### Prerequisites
*   Node.js (LTS version)
*   npm or yarn

### Installation
Navigate to the `frontend` directory and install the required dependencies.
```bash
cd frontend
npm install
```

### Development Server
Run the following command to start the local development server.
```bash
nx serve
```
The application will be available at `http://localhost:4200`. The backend API must be running for the application to function correctly.

---

## 3. Project Structure

The application code is organized into three main directories within `src/app`:

*   `/core`: Contains singleton services, authentication logic, guards, interceptors, and application-wide models. Any service that should have only one instance in the application belongs here (e.g., `AuthService`, `NotificationService`).
*   `/shared`: Contains reusable components, directives, and pipes that are not specific to any single feature. Examples include custom button components, page headers, or formatting pipes.
*   `/features`: Contains the main features of the application, with each feature organized into its own module or set of components. This includes pages like `/dashboard`, `/events`, and `/gallery`.

---

## 4. Authentication & Authorization

Client-side authorization is handled through a combination of services and route guards.

*   **`AuthService` (`src/app/core/auth/auth.service.ts`)**: This is the central service for all authentication-related logic. It holds the current user's information, roles, and permissions. It provides helper methods like `isAdmin()`, `isManager()`, and `isCommunicationManager()` that are used throughout the application to control access.

*   **Route Guards (`src/app/core/guards/`)**: The application uses functional route guards (`canActivate`) to protect entire pages or features from unauthorized access.
    *   **`auth.guard.ts`**: Ensures a user is logged in before they can access any protected route.
    *   **`admin-or-comm-manager.guard.ts`**: An example of a role-specific guard that restricts access to a route to only the specified roles.

*   **UI-Level Control**: Within components, `*ngIf` directives are used in the HTML templates to show or hide specific UI elements (like buttons or menu items) based on the user's role by calling methods on the `AuthService`. This prevents users from seeing actions they are not authorized to perform.

---

## 5. Key UI Features

*   **Dashboard**: A role-based landing page that provides at-a-glance statistics and quick access to relevant action items (e.g., events pending approval for a manager, or assigned events for staff).
*   **Event Discovery**: A searchable and filterable catalog of all public events. Accessible to all authenticated users.
*   **Event Management**: A full suite of components for creating, editing, and managing the lifecycle of events.
*   **Media Gallery**: A visual grid displaying all images and videos from public events.
*   **Workload**: A restricted page for Admins and Communication Managers to view staff assignments and workload metrics.
