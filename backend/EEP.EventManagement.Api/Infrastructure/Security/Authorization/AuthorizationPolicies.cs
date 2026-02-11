using Microsoft.AspNetCore.Authorization;

namespace Infrastructure.Security.Authorization
{
    public static class AuthorizationPolicies
    {
        public const string IsAdmin = "IsAdmin";
        public const string IsCommunicationManager = "IsCommunicationManager";

        public static void AddPolicies(AuthorizationOptions options)
        {
            options.AddPolicy(IsAdmin, policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy(IsCommunicationManager, policy =>
                policy.RequireRole("Manager")
                      .RequireClaim("DepartmentId", "2")); // Example: 2 = Communication
        }
    }
}
