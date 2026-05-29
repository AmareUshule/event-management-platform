using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class RequestEventDateChangeCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }

        [Required]
        public DateTime ProposedStartDate { get; set; }

        [Required]
        public DateTime ProposedEndDate { get; set; }

        public string? ProposedEventPlace { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;
    }
}