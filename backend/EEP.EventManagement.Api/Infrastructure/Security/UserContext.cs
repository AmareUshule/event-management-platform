using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace EEP.EventManagement.Api.Infrastructure.Security
{
    public class UserContext : IUserContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal User => _httpContextAccessor.HttpContext?.User;

        public Guid GetUserId()
        {
            var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }

        public string? GetUserName()
        {
            return User?.Identity?.Name;
        }

        public string? GetUserEmail()
        {
            return User?.FindFirst(ClaimTypes.Email)?.Value;
        }

        public bool IsInRole(string roleName)
        {
            return User?.IsInRole(roleName) ?? false;
        }

        public IEnumerable<Claim> GetUserClaims()
        {
            return User?.Claims ?? Enumerable.Empty<Claim>();
        }

        public bool HasClaim(string type, string value)
        {
            return User?.HasClaim(type, value) ?? false;
        }

        public IEnumerable<string> GetRoles()
        {
            return User?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? Enumerable.Empty<string>();
        }

        public Guid? GetDepartmentId()
        {
            var deptClaim = User?.FindFirst("DepartmentId")?.Value;
            return deptClaim != null && Guid.TryParse(deptClaim, out var deptId) ? deptId : null;
        }
    }
}