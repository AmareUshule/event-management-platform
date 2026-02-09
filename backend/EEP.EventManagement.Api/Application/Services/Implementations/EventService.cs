using EEP.EventManagement.Api.DTOs.Events;
using EEP.EventManagement.Application.Services.Interfaces;
using EEP.EventManagement.Domain.Entities;
using EEP.EventManagement.Domain.Enums;
using EEP.EventManagement.Infrastructure.Repositories.Interfaces;

namespace EEP.EventManagement.Application.Services.Implementations;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepository;

    public EventService(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    public async Task<EventResponseDto> CreateAsync(CreateEventDto dto)
    {
        var eventEntity = new Event
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            EventDate = dto.EventDate,
            Location = dto.Location,
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

    public async Task<List<EventResponseDto>> GetAllAsync()
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
