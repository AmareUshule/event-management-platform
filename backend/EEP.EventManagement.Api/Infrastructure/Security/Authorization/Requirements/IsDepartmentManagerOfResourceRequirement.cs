using Microsoft.AspNetCore.Authorization;
using System;

namespace EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements
{
    public class IsDepartmentManagerOfResourceRequirement : IAuthorizationRequirement
    {
        public Guid DepartmentId { get; }

        public IsDepartmentManagerOfResourceRequirement(Guid departmentId)
        {
            DepartmentId = departmentId;
        }
    }
}
