## Implemented Authorization Policies

This document summarizes the authorization policies implemented in the EEP.EventManagement.Api project, based on the provided User Roles & Access Model.

### 1. Roles Defined

The following roles are defined and seeded in the application:
*   **Admin**
*   **Manager**
*   **Expert**
*   **Cameraman**

### 2. Custom Authorization Requirements and Handlers

To support complex authorization logic, the following custom requirements and their handlers have been implemented:

*   **IsCommunicationManagerRequirement / IsCommunicationManagerHandler:**
    *   **Purpose:** Checks if a user has the `Manager` role AND belongs to the "Communication" department.
    *   **Dependencies:** `UserManager<ApplicationUser>`, `IDepartmentRepository`.

*   **IsAssignedToEventRequirement / IsAssignedToEventHandler:**
    *   **Purpose:** Checks if a user (specifically `Expert` or `Cameraman` roles) is assigned to a particular event.
    *   **Dependencies:** `UserManager<ApplicationUser>`, `IAssignmentRepository`.
    *   **Note:** The `Assignment` entity was updated to include a `UserId` property to facilitate this check.

*   **IsDepartmentManagerOfResourceRequirement / IsDepartmentManagerOfResourceHandler:**
    *   **Purpose:** Checks if a user has the `Manager` role AND their department matches the department associated with a specific resource (e.g., a dashboard).
    *   **Dependencies:** `UserManager<ApplicationUser>`, `IDepartmentRepository`.

### 3. Authorization Policies Defined

The following authorization policies are defined in `EEP.EventManagement.Api.Infrastructure.Security.Authorization.AuthorizationPolicies.cs` and registered in `Program.cs`:

*   **IsAdmin:**
    *   **Requirement:** User must have the `Admin` role.
    *   **Usage:** `[Authorize(Policy = AuthorizationPolicies.IsAdmin)]`

*   **IsCommunicationManager:**
    *   **Requirement:** User must satisfy the `IsCommunicationManagerRequirement` (i.e., be a `Manager` in the "Communication" department).
    *   **Usage:** `[Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]`

*   **CanCreateEvent:**
    *   **Requirement:** User must have either the `Admin` or `Manager` role.
    *   **Usage:** `[Authorize(Policy = AuthorizationPolicies.CanCreateEvent)]`

*   **CanApproveAndAssign:**
    *   **Requirement:** User must have the `Admin` role AND satisfy the `IsCommunicationManagerRequirement`.
    *   **Note:** This policy currently implements `AND` logic. For `OR` logic (Admin OR Communication Manager), imperative authorization will be used in the controller, or separate policies will be combined.
    *   **Usage:** `[Authorize(Policy = AuthorizationPolicies.CanApproveAndAssign)]`

*   **CanAssignStaff:**
    *   **Requirement:** User must have the `Admin` role AND satisfy the `IsCommunicationManagerRequirement`.
    *   **Note:** Similar to `CanApproveAndAssign`, this policy implements `AND` logic. For `OR` logic, imperative authorization will be used.
    *   **Usage:** `[Authorize(Policy = AuthorizationPolicies.CanAssignStaff)]`

*   **CanUploadMedia:**
    *   **Requirement:** User must have `Admin`, `Expert`, or `Cameraman` role AND satisfy the `IsCommunicationManagerRequirement`.
    *   **Note:** This policy implements `AND` logic. For the "assigned only" part for `Expert`/`Cameraman`, imperative authorization will be used in the controller.
    *   **Usage:** `[Authorize(Policy = AuthorizationPolicies.CanUploadMedia)]`

*   **CanViewDashboards:**
    *   **Requirement:** User must have `Admin` or `Manager` role AND satisfy the `IsCommunicationManagerRequirement`.
    *   **Note:** This policy implements `AND` logic. For the "own dept" part for `Manager`, imperative authorization will be used in the controller.
    *   **Usage:** `[Authorize(Policy = AuthorizationPolicies.CanViewDashboards)]`

### 4. Controller/Action Authorization Implementation

The `[Authorize]` and `[AllowAnonymous]` attributes have been applied to controllers and specific actions:

*   **`AuthController`:**
    *   `[ApiController]`, `[Route("api/[controller]")]`
    *   `Register` action: `[AllowAnonymous]`
    *   `Login` action: `[AllowAnonymous]`
    *   `UpdateUser`, `DeleteUser`, `GetUserById`, `GetAllUsers` actions: `[Authorize(Roles = "Admin,Manager")]`

*   **`DepartmentsController`:**
    *   `[ApiController]`, `[Route("api/[controller]")]`
    *   Controller level: `[Authorize(Roles = "Admin,Manager")]` (All actions require Admin or Manager roles)

*   **`ApprovalController`:**
    *   `[ApiController]`, `[Route("api/[controller]")]`
    *   Controller level: `[Authorize(Policy = AuthorizationPolicies.CanApproveAndAssign)]`

*   **`AssignmentsController`:**
    *   `[ApiController]`, `[Route("api/[controller]")]`
    *   Controller level: `[Authorize(Policy = AuthorizationPolicies.CanAssignStaff)]`

*   **`EventsController`:**
    *   `[ApiController]`, `[Route("api/events")]`
    *   Controller level: `[Authorize]` (All actions require authentication)
    *   `Create` action: `[Authorize(Policy = AuthorizationPolicies.CanCreateEvent)]`

*   **`MediaController`:**
    *   `[ApiController]`, `[Route("api/[controller]")]`
    *   Controller level: `[Authorize(Roles = "Admin,Manager,Expert,Cameraman")]`
    *   **Note:** For "Upload media (assigned only)" for `Expert`/`Cameraman`, imperative authorization will be implemented within the action method.

*   **`ReportsController`:**
    *   `[ApiController]`, `[Route("api/[controller]")]`
    *   Controller level: `[Authorize(Roles = "Admin,Manager")]`
    *   **Note:** For "View dashboards (own dept)" for `Manager`, imperative authorization will be implemented within the action method.

*   **`StatusController`:**
    *   `[ApiController]`, `[Route("api/[controller]")]`
    *   `Get` action: `[AllowAnonymous]` (Accessible without authentication)

### 5. Imperative Authorization (Future Implementation)

For policies requiring runtime data (e.g., checking if a user is assigned to a specific event, or if a resource belongs to a user's department), imperative authorization will be used within the controller action methods. This involves injecting `IAuthorizationService` and calling `_authorizationService.AuthorizeAsync(User, resource, requirement)`.
