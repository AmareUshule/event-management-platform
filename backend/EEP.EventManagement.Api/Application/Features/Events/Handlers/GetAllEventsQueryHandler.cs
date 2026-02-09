
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Infrastructure.Repositories.Interfaces;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class GetAllEventsQueryHandler : IRequestHandler<GetAllEventsQuery, List<EventResponseDto>>
    {
        private readonly IEventRepository _eventRepository;

        public GetAllEventsQueryHandler(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<List<EventResponseDto>> Handle(GetAllEventsQuery request, CancellationToken cancellationToken)
        {
            var events = await _eventRepository.GetAllAsync();

            return events.Select(e => new EventResponseDto
            {
                Id = e.Id,
                Title = e.Title,
                EventDate = e.EventDate,
                Status = e.Status.ToString()
            }).ToList();
        }
    }
}
