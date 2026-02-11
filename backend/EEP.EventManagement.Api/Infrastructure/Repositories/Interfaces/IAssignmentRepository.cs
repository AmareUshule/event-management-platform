using EEP.EventManagement.Api.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;

public interface IAssignmentRepository
{
    Task AddAsync(Assignment assignment);
    Task<Assignment?> GetByIdAsync(Guid id);
    Task<List<Assignment>> GetAllAsync();
    Task UpdateAsync(Assignment assignment);
    Task DeleteAsync(Assignment assignment);
    Task<List<Assignment>> GetAssignmentsByUserIdAndEventIdAsync(Guid userId, Guid eventId);
}
