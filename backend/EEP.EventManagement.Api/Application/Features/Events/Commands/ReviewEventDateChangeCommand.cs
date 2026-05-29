using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class ReviewEventDateChangeCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }

        [Required]
        public bool Approved { get; set; }
        
        public string? ReviewComment { get; set; }
    }
}