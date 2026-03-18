using System.ComponentModel.DataAnnotations;
using EEP.EventManagement.Api.Domain.Enums;

namespace EEP.EventManagement.Api.Application.Features.Assignments.DTOs
{
    public class UpdateAssignmentStatusDto
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        public AssignmentStatus Status { get; set; }

        public string? DeclineReason { get; set; }
    }
}
