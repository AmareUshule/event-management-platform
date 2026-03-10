using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Approval.Commands
{
    public class ApproveEventCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }
    }
}
