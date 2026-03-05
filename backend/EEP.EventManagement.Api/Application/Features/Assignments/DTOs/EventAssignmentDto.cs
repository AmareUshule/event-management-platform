using EEP.EventManagement.Api.Application.Features.Auth.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Assignments.DTOs
{
    public class EventAssignmentDto
    {
        public Guid Id { get; set; }
        public UserResponseDto? Employee { get; set; }
        public UserResponseDto? AssignedBy { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? DeclineReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
