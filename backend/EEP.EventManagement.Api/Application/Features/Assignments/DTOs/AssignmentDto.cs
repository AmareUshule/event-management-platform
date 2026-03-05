using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Assignments.DTOs
{
    public class AssignmentDto
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public UserResponseDto? Employee { get; set; }
        public UserResponseDto? AssignedBy { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? DeclineReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
