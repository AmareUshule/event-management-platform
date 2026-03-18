using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid DepartmentId { get; set; }
        public string? EventPlace { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventStatus Status { get; set; } = EventStatus.Draft;
        public Guid CreatedBy { get; set; }
        public Guid? ApprovedBy { get; set; }

        // Navigation properties
        public Department Department { get; set; } = null!;
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser CreatedByUser { get; set; } = null!;
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? ApprovedByUser { get; set; }
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}