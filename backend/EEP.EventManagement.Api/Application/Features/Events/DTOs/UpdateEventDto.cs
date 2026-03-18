using System;
using System.ComponentModel.DataAnnotations;
using EEP.EventManagement.Api.Domain.Enums;

namespace EEP.EventManagement.Api.Application.Features.Events.DTOs
{
    public class UpdateEventDto
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string? EventPlace { get; set; }

        [Required]
        public Guid DepartmentId { get; set; }

        public EventStatus Status { get; set; }
    }
}