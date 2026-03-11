using EEP.EventManagement.Api.Domain.Enums;
using System;

namespace EEP.EventManagement.Api.Application.Features.Announcements.DTOs
{
    public class UpdateAnnouncementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
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
    }
}
