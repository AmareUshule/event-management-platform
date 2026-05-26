using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Events.DTOs
{
    public class SimplifiedDepartmentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class SimplifiedUserDto
    {
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public Guid? DepartmentId { get; set; }
    }

    public class SimplifiedAssignmentDto
    {
        public Guid Id { get; set; }
        public Guid EmployeeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? VerificationNote { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public AssignedByDto? VerifiedBy { get; set; }
        public AssignedByDto? AssignedBy { get; set; }
    }

    public class AssignedByDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class GroupedAssignmentsDto
    {
        public List<SimplifiedAssignmentDto> Cameraman { get; set; } = new();
        public List<SimplifiedAssignmentDto> Expert { get; set; } = new();
    }
}
