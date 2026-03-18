using EEP.EventManagement.Api.Domain.Entities;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;

public interface IDepartmentRepository
{
    Task AddAsync(Department department);
    Task<Department?> GetByIdAsync(Guid id);
    Task<List<Department>> GetAllAsync();
    Task UpdateAsync(Department department);
    Task DeleteAsync(Department department);
    Task<Department?> GetByNameAsync(string name);
}
