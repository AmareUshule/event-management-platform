using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class CreateEventCommand : IRequest<EventResponseDto>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid DepartmentId { get; set; }
        public string EventPlace { get; set; } = string.Empty;
    }
}