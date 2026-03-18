using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class CreateEventCommand : IRequest<EventDto>
    {
        public CreateEventDto CreateEventDto { get; set; }
    }
}