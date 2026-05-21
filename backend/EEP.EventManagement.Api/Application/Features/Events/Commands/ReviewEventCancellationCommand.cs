using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class ReviewEventCancellationCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }
        public bool Approved { get; set; }
        public string ReviewComment { get; set; } = string.Empty;
    }
}
