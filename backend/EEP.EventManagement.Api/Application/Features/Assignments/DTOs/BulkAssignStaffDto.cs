using System.ComponentModel.DataAnnotations;

namespace EEP.EventManagement.Api.Application.Features.Assignments.DTOs
{
    public class BulkAssignStaffDto
    {
        [Required]
        public Guid EventId { get; set; }

        public Guid? CameramanId { get; set; }
        public Guid? ExpertId { get; set; }
    }
}
