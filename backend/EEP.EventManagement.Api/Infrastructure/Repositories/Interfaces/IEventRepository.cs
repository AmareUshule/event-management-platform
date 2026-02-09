using EEP.EventManagement.Domain.Entities;

namespace EEP.EventManagement.Infrastructure.Repositories.Interfaces;

public interface IEventRepository
{
    Task AddAsync(Event eventEntity);
    Task<List<Event>> GetAllAsync();
}
