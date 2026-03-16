using EEP.EventManagement.Api.Domain.Common;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class AnnouncementMedia : BaseEntity
    {
        public Guid AnnouncementId { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty; // "Image" or "Pdf"
        public string ContentType { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public Guid UploadedBy { get; set; }

        // Navigation properties
        public Announcement Announcement { get; set; } = null!;
    }
}
