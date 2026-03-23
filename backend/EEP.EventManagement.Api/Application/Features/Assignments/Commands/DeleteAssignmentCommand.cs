using MediatR;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using System;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Commands
{
    public class DeleteAssignmentCommand : IRequest<EventDto>
    {
        public Guid EventId { get; set; }
        public Guid AssignmentId { get; set; }
    }
}
