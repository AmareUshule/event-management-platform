using EEP.EventManagement.Api.Domain.Entities;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;

public interface IEventRepository
{
    Task AddAsync(Event eventEntity);
    Task<List<Event>> GetAllAsync();
}
