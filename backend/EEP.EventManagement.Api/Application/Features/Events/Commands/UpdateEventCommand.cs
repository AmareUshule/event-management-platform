using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class UpdateEventCommand : IRequest<EventDto>
    {
        public UpdateEventDto UpdateEventDto { get; set; }
    }
}