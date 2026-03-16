using System;

namespace EEP.EventManagement.Api.Application.Features.Announcements.DTOs
{
    public class AnnouncementMediaDto
    {
        public Guid Id { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty; // "Image" or "Pdf"
        public string ContentType { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public Guid UploadedBy { get; set; }
    }
}
