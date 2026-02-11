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

            // For policies with OR logic involving custom requirements, we will handle them imperatively in controllers
            // or define separate policies and combine them using [Authorize(Policy = "Policy1,Policy2")]
            options.AddPolicy(CanApproveAndAssign, policy =>
                policy.RequireRole("Admin")
                      .AddRequirements(new IsCommunicationManagerRequirement())); // This is AND logic, will be handled imperatively

            options.AddPolicy(CanAssignStaff, policy =>
                policy.RequireRole("Admin")
                      .AddRequirements(new IsCommunicationManagerRequirement())); // This is AND logic, will be handled imperatively

            options.AddPolicy(CanUploadMedia, policy =>
                policy.RequireRole("Admin", "Expert", "Cameraman") // Admin, Expert, Cameraman can upload media
                      .AddRequirements(new IsCommunicationManagerRequirement())); // This is AND logic, will be handled imperatively

            options.AddPolicy(CanViewDashboards, policy =>
                policy.RequireRole("Admin", "Manager") // Admin and any Manager can view dashboards
                      .AddRequirements(new IsCommunicationManagerRequirement())); // This is AND logic, will be handled imperatively
        }
    }
}
