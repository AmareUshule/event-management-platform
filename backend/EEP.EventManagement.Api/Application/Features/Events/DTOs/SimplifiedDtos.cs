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
        public string EmployeeId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class SimplifiedAssignmentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public AssignedByDto? AssignedBy { get; set; }
    }

    public class AssignedByDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class GroupedAssignmentsDto
    {
        public List<SimplifiedAssignmentDto> Cameraman { get; set; } = new();
        public List<SimplifiedAssignmentDto> Expert { get; set; } = new();
    }
}
