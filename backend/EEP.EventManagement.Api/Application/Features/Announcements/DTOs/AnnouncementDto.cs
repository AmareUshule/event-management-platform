using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Announcements.DTOs
{
    public class AnnouncementDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
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
        public SimplifiedDepartmentDto? Department { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public AnnouncementUserDto? CreatedBy { get; set; }
        public AnnouncementUserDto? ApprovedBy { get; set; }
        public List<AnnouncementImageDto> Images { get; set; } = new();
    }

    public class AnnouncementImageDto
    {
        public Guid Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }

    public class AnnouncementUserDto
    {
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
