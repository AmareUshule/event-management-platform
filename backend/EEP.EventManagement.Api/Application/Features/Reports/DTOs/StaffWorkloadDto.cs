using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Reports.DTOs
{
    public class StaffWorkloadDto
    {
        public Guid StaffId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        
        public int TotalAssignments { get; set; }
        public int ScheduledAssignments { get; set; }
        public int PastAssignments { get; set; }
        
        public List<StaffEventSummaryDto> Events { get; set; } = new List<StaffEventSummaryDto>();
    }

    public class StaffEventSummaryDto
    {
        public Guid AssignmentId { get; set; }
        public Guid EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? EventPlace { get; set; }
        public string? EventDepartmentName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string RoleInEvent { get; set; } = string.Empty;
    }
}
