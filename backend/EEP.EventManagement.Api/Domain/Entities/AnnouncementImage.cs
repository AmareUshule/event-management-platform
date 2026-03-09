using EEP.EventManagement.Api.Domain.Common;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class AnnouncementImage : BaseEntity
    {
        public Guid AnnouncementId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }

        // Navigation properties
        public Announcement Announcement { get; set; } = null!;
    }
}
