using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Announcement : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public AnnouncementStatus Status { get; set; } = AnnouncementStatus.Draft;
        public AnnouncementType Type { get; set; } = AnnouncementType.General;
        public Guid? DepartmentId { get; set; }
        public DateTime? Deadline { get; set; }
        public string? Requirements { get; set; }
        public string? Experience { get; set; }
        public string? Training { get; set; }
        public string? Certificate { get; set; }
        public int? RequiredNumber { get; set; }
        public string? OtherOptionalRequirements { get; set; }
        public string? Grade { get; set; }
        public string? WorkPlace { get; set; }
        public string? JobCode { get; set; }
        public Guid CreatedBy { get; set; }
        public Guid? ApprovedBy { get; set; }

        // Navigation properties
        public Department? Department { get; set; }
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser CreatedByUser { get; set; } = null!;
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? ApprovedByUser { get; set; }
        public ICollection<AnnouncementImage> Images { get; set; } = new List<AnnouncementImage>();
    }
}
