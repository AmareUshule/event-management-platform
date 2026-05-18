using System;
using System.ComponentModel.DataAnnotations;

namespace EEP.EventManagement.Api.Application.Features.Events.DTOs
{
    public class CreateEventDto
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string? EventPlace { get; set; }
        public string? CoverImageUrl { get; set; }
        public Guid? DepartmentId { get; set; }
    }
}
