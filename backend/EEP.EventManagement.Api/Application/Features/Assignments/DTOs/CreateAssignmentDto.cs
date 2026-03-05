using System.ComponentModel.DataAnnotations;
using EEP.EventManagement.Api.Domain.Enums;

namespace EEP.EventManagement.Api.Application.Features.Assignments.DTOs
{
    public class CreateAssignmentDto
    {
        [Required]
        public Guid EventId { get; set; }

        [Required]
        public Guid EmployeeId { get; set; }

        [Required]
        public AssignmentRole Role { get; set; }
    }
}
