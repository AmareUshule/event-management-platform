using Microsoft.AspNetCore.Authorization;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements;
using System;

namespace EEP.EventManagement.Api.Infrastructure.Security.Authorization
{
    public static class AuthorizationPolicies
    {
        // Policy Names
        public const string IsAdmin = "IsAdmin";
        public const string IsCommunicationManager = "IsCommunicationManager";
        public const string CanCreateEvent = "CanCreateEvent";
        public const string CanApproveAndAssign = "CanApproveAndAssign";
        public const string CanAssignStaff = "CanAssignStaff";
        public const string CanUploadMedia = "CanUploadMedia";
        public const string CanViewDashboards = "CanViewDashboards";

        public static void AddPolicies(AuthorizationOptions options)
        {
            options.AddPolicy(IsAdmin, policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy(IsCommunicationManager, policy =>
                policy.AddRequirements(new IsCommunicationManagerRequirement()));

            options.AddPolicy(CanCreateEvent, policy =>
                policy.RequireRole("Admin", "Manager")); // Both Admin and any Manager can create events

            // These policies now use the requirements which have been updated to allow Admins as well.
            // By using only the requirement, we achieve "Admin OR (Manager AND Dept=Communication)" logic.
            options.AddPolicy(CanApproveAndAssign, policy =>
                policy.AddRequirements(new IsCommunicationManagerRequirement()));

            options.AddPolicy(CanAssignStaff, policy =>
                policy.AddRequirements(new IsCommunicationManagerRequirement()));

            options.AddPolicy(CanUploadMedia, policy =>
                policy.RequireRole("Admin", "Expert", "Cameraman")); 

            options.AddPolicy(CanViewDashboards, policy =>
                policy.RequireRole("Admin", "Manager"));
        }
    }
}
