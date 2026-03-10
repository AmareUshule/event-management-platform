using EEP.EventManagement.Api.Domain.Enums;
using System;

namespace EEP.EventManagement.Api.Application.Features.Announcements.DTOs
{
    public class CreateAnnouncementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public AnnouncementType Type { get; set; } = AnnouncementType.General;
        public Guid? DepartmentId { get; set; }
        public DateTime? Deadline { get; set; }
    }
}
