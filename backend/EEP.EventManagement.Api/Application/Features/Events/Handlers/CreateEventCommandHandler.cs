
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Domain.Entities;
using EEP.EventManagement.Domain.Enums;
using EEP.EventManagement.Infrastructure.Repositories.Interfaces;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, EventResponseDto>
    {
        private readonly IEventRepository _eventRepository;

        public CreateEventCommandHandler(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<EventResponseDto> Handle(CreateEventCommand request, CancellationToken cancellationToken)
        {
            var eventEntity = new Event
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                EventDate = request.EventDate,
                Location = request.Location,
                Status = EventStatus.Draft
            };

            await _eventRepository.AddAsync(eventEntity);

            return new EventResponseDto
            {
                Id = eventEntity.Id,
                Title = eventEntity.Title,
                EventDate = eventEntity.EventDate,
                Status = eventEntity.Status.ToString()
            };
        }
    }
}
