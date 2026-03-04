using EEP.EventManagement.Api.Domain.Enums;
using System;
using System.Collections.Generic;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs; // For UserResponseDto
using EEP.EventManagement.Api.Application.Features.Departments.DTOs; // For DepartmentResponseDto
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs; // For AssignmentDto

namespace EEP.EventManagement.Api.Application.Features.Events.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? EventPlace { get; set; }
        public string Status { get; set; } = string.Empty; // Directly human-readable string

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Related data
        public DepartmentResponseDto? Department { get; set; }
        public UserResponseDto? CreatedBy { get; set; } // Renamed and changed type
        public UserResponseDto? ApprovedBy { get; set; } // Renamed and changed type
        public List<AssignmentDto>? Assignments { get; set; } // List of assignments for this event
    }
}