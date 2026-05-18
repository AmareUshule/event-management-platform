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
        public string Category { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        public string? EventPlace { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventStatus Status { get; set; } = EventStatus.Draft;
        public Guid CreatedBy { get; set; }
        public Guid? ApprovedBy { get; set; }
        public string? ClosureComment { get; set; }
        public Guid? FinalizedBy { get; set; }

        // Navigation properties
        public Department Department { get; set; } = null!;
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser CreatedByUser { get; set; } = null!;
        
        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("ApprovedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? ApprovedByUser { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("FinalizedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? FinalizedByUser { get; set; }
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
        public ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();
    }
}
