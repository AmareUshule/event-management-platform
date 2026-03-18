using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Implementations;

public class AssignmentRepository : IAssignmentRepository
{
    private readonly ApplicationDbContext _context;

    public AssignmentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Assignment assignment)
    {
        await _context.Assignments.AddAsync(assignment);
        await _context.SaveChangesAsync();
    }

    public async Task<Assignment?> GetByIdAsync(Guid id)
    {
        return await _context.Assignments
            .Include(a => a.Event)
            .Include(a => a.Employee)
            .Include(a => a.AssignedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<List<Assignment>> GetAllAsync()
    {
        return await _context.Assignments
            .Include(a => a.Event)
            .Include(a => a.Employee)
            .Include(a => a.AssignedByUser)
            .ToListAsync();
    }

    public async Task UpdateAsync(Assignment assignment)
    {
        _context.Assignments.Update(assignment);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Assignment assignment)
    {
        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Assignment>> GetAssignmentsByEmployeeIdAndEventIdAsync(Guid employeeId, Guid eventId)
    {
        return await _context.Assignments
            .Include(a => a.Event)
            .Include(a => a.Employee)
            .Include(a => a.AssignedByUser)
            .Where(a => a.EmployeeId == employeeId && a.EventId == eventId)
            .ToListAsync();
    }

    public async Task<List<Assignment>> GetAssignmentsByEmployeeIdAsync(Guid employeeId)
    {
        return await _context.Assignments
            .Include(a => a.Event)
            .Include(a => a.Employee)
            .Include(a => a.AssignedByUser)
            .Where(a => a.EmployeeId == employeeId)
            .ToListAsync();
    }

    public async Task<bool> IsEmployeeAssignedWithRoleAsync(Guid employeeId, Guid eventId, AssignmentRole role)
    {
        return await _context.Assignments.AnyAsync(a => a.EmployeeId == employeeId && a.EventId == eventId && a.Role == role);
    }

    public async Task<List<Assignment>> GetAssignmentsByEventIdAsync(Guid eventId)
    {
        return await _context.Assignments
            .Include(a => a.Employee)
            .Include(a => a.AssignedByUser)
            .Where(a => a.EventId == eventId)
            .ToListAsync();
    }
}
