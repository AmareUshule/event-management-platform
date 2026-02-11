
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class CreateEventCommand : IRequest<EventResponseDto>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}
