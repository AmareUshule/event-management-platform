using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Events.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? EventPlace { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string TimeStatus { get; set; } = string.Empty;

        public SimplifiedDepartmentDto? Department { get; set; }
        public SimplifiedUserDto? CreatedBy { get; set; }
        public SimplifiedUserDto? ApprovedBy { get; set; }
        public GroupedAssignmentsDto? Assignments { get; set; }
    }
}
