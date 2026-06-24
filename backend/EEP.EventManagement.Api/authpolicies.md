## Implemented Authorization Policies

This document summarizes the authorization policies implemented in the EEP.EventManagement.Api project. This should be the source of truth for understanding backend security rules.

### 1. Roles Defined

The following roles are defined and seeded in the application:
*   **Admin**: Superuser with access to all system functions.
*   **Manager**: A user with management capabilities, typically scoped to a department.
*   **Expert**: A staff member assigned to events.
*   **Cameraman**: A staff member assigned to events.
*   **Employee**: A general user with basic access.

### 2. Custom Authorization Requirements and Handlers

To support complex authorization logic, the following custom requirements and their handlers have been implemented.

*   **IsCommunicationManagerRequirement / IsCommunicationManagerHandler:**
    *   **Purpose:** Checks if a user is a **Communication Manager**. The requirement is successfully met if the user has the `Admin` role, OR if they have the `Manager` role AND belong to the "Communication" department.
    *   **Dependencies:** `UserManager<ApplicationUser>`, `IDepartmentRepository`.

*   **IsAssignedToEventRequirement / IsAssignedToEventHandler:**
    *   **Purpose:** Checks if a user (specifically `Expert` or `Cameraman` roles) is assigned to a particular event. This is used for imperative authorization checks.
    *   **Dependencies:** `UserManager<ApplicationUser>`, `IAssignmentRepository`.

*   **IsDepartmentManagerOfResourceRequirement / IsDepartmentManagerOfResourceHandler:**
    *   **Purpose:** Checks if a user has the `Manager` role AND their department matches the department associated with a specific resource (e.g., an event). Used for imperative authorization.
    *   **Dependencies:** `UserManager<ApplicationUser>`, `IDepartmentRepository`.

### 3. Authorization Policies Defined

The following authorization policies are defined in `Infrastructure/Security/Authorization/AuthorizationPolicies.cs` and registered in `Program.cs`.

*   **IsAdmin:**
    *   **Requirement:** User must have the `Admin` role.
    *   **Usage:** `[Authorize(Policy = "IsAdmin")]`

*   **IsCommunicationManager:**
    *   **Requirement:** User must satisfy the `IsCommunicationManagerRequirement`.
    *   **Usage:** `[Authorize(Policy = "IsCommunicationManager")]`

*   **CanCreateEvent:**
    *   **Requirement:** User must have either the `Admin` or `Manager` role.
    *   **Usage:** `[Authorize(Policy = "CanCreateEvent")]`

*   **CanApproveAndAssign / CanAssignStaff:**
    *   **Requirement:** User must satisfy the `IsCommunicationManagerRequirement`.
    *   **Note:** This policy implements an **OR** logic. It is satisfied if the user is an **Admin** OR a **Communication Manager**.
    *   **Usage:** `[Authorize(Policy = "CanApproveAndAssign")]`

### 4. Controller/Action Authorization Implementation

*   **`AuthController`:**
    *   `Register`, `Login`: `[AllowAnonymous]`
    *   `UpdateUser`, `DeleteUser`, `GetUserById`, `GetAllUsers`: `[Authorize(Roles = "Admin,Manager")]`

*   **`DepartmentsController`:**
    *   The controller has a base `[Authorize]` attribute, requiring authentication for all actions.
    *   **Read Actions** (`GetAllDepartments`, `GetDepartmentById`): Accessible to **any authenticated user**.
    *   **Write Actions** (`CreateDepartment`, `UpdateDepartment`, `DeleteDepartment`): Restricted to `[Authorize(Roles = "Admin,Manager")]`.

*   **`ApprovalController` & `AssignmentsController`:**
    *   Protected by the `CanApproveAndAssign` policy, limiting access to **Admins** and **Communication Managers**.

*   **`EventsController`:**
    *   Controller has a base `[Authorize]` attribute.
    *   `CreateEvent`: `[Authorize(Policy = "CanCreateEvent")]` (Admins and all Managers).
    *   `GET /api/events/discovery`: Accessible to **any authenticated user**, but the handler filters data to only show public events.
    *   Other write actions (`Update`, `Delete`, `Approve`, etc.) have specific role or policy checks inside the method.

*   **`MediaController`:**
    *   Controller has a base `[Authorize]` attribute.
    *   **`GET /api/media/gallery`**: Accessible to **any authenticated user**. The handler filters data to only show media from public events (Images and Videos only).
    *   **`POST /api/media/upload`**: Uploads are not restricted by a policy on the controller. They use **imperative authorization** inside the command handler. The rule is: the user must be an **Admin** OR be **assigned to the specific event** they are uploading media to.

*   **`StatusController`:**
    *   `Get`: `[AllowAnonymous]` (public health check).

### 5. Imperative Authorization

For policies requiring runtime data (e.g., checking if a user is assigned to a specific event), imperative authorization is used within the controller or MediatR handler. This involves injecting `IAuthorizationService` and calling `_authorizationService.AuthorizeAsync(...)` or checking user context directly.
