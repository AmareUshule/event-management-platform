using EEP.EventManagement.Api.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces
{
    public interface IEventRepository
    {
        Task<Event> GetByIdAsync(Guid id);
        Task<List<Event>> GetAllAsync();
        Task<Event> AddAsync(Event entity);
        Task UpdateAsync(Event entity);
        Task DeleteAsync(Event entity);
        Task<bool> ExistsAsync(Guid id);
    }
}