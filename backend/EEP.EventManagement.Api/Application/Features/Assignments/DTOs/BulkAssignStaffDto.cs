using System.ComponentModel.DataAnnotations;

namespace EEP.EventManagement.Api.Application.Features.Assignments.DTOs
{
    public class BulkAssignStaffDto
    {
        public Guid EventId { get; set; }

        public string? CameramanId { get; set; }
        public string? ExpertId { get; set; }
    }
}
