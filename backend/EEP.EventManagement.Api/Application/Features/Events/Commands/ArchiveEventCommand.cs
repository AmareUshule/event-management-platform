using MediatR;
using System;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class ArchiveEventCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }
    }
}
