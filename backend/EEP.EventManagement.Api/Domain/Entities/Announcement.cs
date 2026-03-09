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
        public Guid CreatedBy { get; set; }
        public Guid? ApprovedBy { get; set; }

        // Navigation properties
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser CreatedByUser { get; set; } = null!;
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? ApprovedByUser { get; set; }
        public ICollection<AnnouncementImage> Images { get; set; } = new List<AnnouncementImage>();
    }
}
