using MediatR;
using System;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class SubmitEventCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }
    }
}
