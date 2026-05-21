using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class RequestEventCancellationCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
