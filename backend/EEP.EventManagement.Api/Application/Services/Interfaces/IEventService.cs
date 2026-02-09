using EEP.EventManagement.Api.DTOs.Events;

namespace EEP.EventManagement.Application.Services.Interfaces;

public interface IEventService
{
    Task<EventResponseDto> CreateAsync(CreateEventDto dto);
    Task<List<EventResponseDto>> GetAllAsync();
}
