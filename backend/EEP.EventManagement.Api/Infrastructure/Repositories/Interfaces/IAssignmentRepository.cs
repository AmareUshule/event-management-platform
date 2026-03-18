using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
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
    Task<List<Assignment>> GetAssignmentsByEmployeeIdAndEventIdAsync(Guid employeeId, Guid eventId);
    Task<List<Assignment>> GetAssignmentsByEmployeeIdAsync(Guid employeeId);
    Task<bool> IsEmployeeAssignedWithRoleAsync(Guid employeeId, Guid eventId, AssignmentRole role);
    Task<List<Assignment>> GetAssignmentsByEventIdAsync(Guid eventId);
}
