using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;

namespace EEP.EventManagement.Api.Infrastructure.Security.Claims
{
    public class CustomClaimsTransformation : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            // Example: add department claim
            var identity = (ClaimsIdentity)principal.Identity!;
            if (!identity.HasClaim(c => c.Type == "DepartmentId"))
            {
                // Add department claim here, e.g., from database
                identity.AddClaim(new Claim("DepartmentId", "0")); 
            }

            return Task.FromResult(principal);
        }
    }
}
