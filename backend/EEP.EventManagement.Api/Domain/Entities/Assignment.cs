using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Assignment : BaseEntity
    {
        public Guid EventId { get; set; }
        public Event? Event { get; set; }
        
        public Guid EmployeeId { get; set; }
        public ApplicationUser? Employee { get; set; }
        
        public Guid AssignedBy { get; set; }
        public ApplicationUser? AssignedByUser { get; set; }
        
        public AssignmentStatus Status { get; set; } = AssignmentStatus.Pending;
        public AssignmentRole Role { get; set; }
        public string? DeclineReason { get; set; }
    }
}
