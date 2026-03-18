using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace EEP.EventManagement.Api.Infrastructure.Security.Claims
{
    public interface IUserContext
    {
        Guid GetUserId();
        string? GetUserName();
        string? GetUserEmail();
        bool IsInRole(string roleName);
        IEnumerable<Claim> GetUserClaims();
        bool HasClaim(string type, string value);
        IEnumerable<string> GetRoles();
        Guid? GetDepartmentId();
    }
}