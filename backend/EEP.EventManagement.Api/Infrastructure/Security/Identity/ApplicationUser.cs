// EEP.EventManagement.Api/Infrastructure/Security/Identity/ApplicationUser.cs
using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;

namespace EEP.EventManagement.Api.Infrastructure.Security.Identity
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;

        // Foreign key for Department
        public Guid? DepartmentId { get; set; }

        // Navigation property to Department
        public Department? Department { get; set; }
    }
}