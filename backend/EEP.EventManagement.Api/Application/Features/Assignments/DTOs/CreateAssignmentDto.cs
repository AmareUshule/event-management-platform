using System.ComponentModel.DataAnnotations;
using EEP.EventManagement.Api.Domain.Enums;

namespace EEP.EventManagement.Api.Application.Features.Assignments.DTOs
{
    public class CreateAssignmentDto
    {
        public Guid EventId { get; set; }

        [Required]
        public string EmployeeId { get; set; } = string.Empty;

        [Required]
        public AssignmentRole Role { get; set; }
    }
}
