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
        public string? CoverImageUrl { get; set; }
        public SimplifiedDepartmentDto? Department { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public AnnouncementUserDto? CreatedBy { get; set; }
        public AnnouncementUserDto? ApprovedBy { get; set; }
        public List<AnnouncementMediaDto> Media { get; set; } = new();
        public List<JobVacancyDto> JobVacancies { get; set; } = new();
    }



    public class AnnouncementUserDto
    {
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
