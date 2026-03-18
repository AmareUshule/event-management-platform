using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Implementations
{
    public class EventRepository : IEventRepository
    {
        private readonly ApplicationDbContext _context;

        public EventRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Event> GetByIdAsync(Guid id)
        {
            return await _context.Events
                .Include(e => e.Department)
                .Include(e => e.CreatedByUser)
                .Include(e => e.ApprovedByUser)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.Employee)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.AssignedByUser)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<Event>> GetAllAsync()
        {
            return await _context.Events
                .Include(e => e.Department)
                .Include(e => e.CreatedByUser)
                .Include(e => e.ApprovedByUser)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.Employee)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.AssignedByUser)
                .ToListAsync();
        }

        public async Task<List<Event>> GetUpcomingAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Events
                .Include(e => e.Department)
                .Include(e => e.CreatedByUser)
                .Include(e => e.ApprovedByUser)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.Employee)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.AssignedByUser)
                .Where(e => e.StartDate >= now && e.Status == Domain.Enums.EventStatus.Scheduled)
                .OrderBy(e => e.StartDate)
                .ToListAsync();
        }

        public async Task<List<Event>> GetByDepartmentIdAsync(Guid departmentId)
        {
            return await _context.Events
                .Include(e => e.Department)
                .Include(e => e.CreatedByUser)
                .Include(e => e.ApprovedByUser)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.Employee)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.AssignedByUser)
                .Where(e => e.DepartmentId == departmentId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Event>> GetByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.Events
                .Include(e => e.Department)
                .Include(e => e.CreatedByUser)
                .Include(e => e.ApprovedByUser)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.Employee)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.AssignedByUser)
                .Where(e => e.Assignments.Any(a => a.EmployeeId == employeeId))
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Event>> GetApprovedAsync()
        {
            return await _context.Events
                .Include(e => e.Department)
                .Include(e => e.CreatedByUser)
                .Include(e => e.ApprovedByUser)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.Employee)
                .Include(e => e.Assignments)
                    .ThenInclude(a => a.AssignedByUser)
                .Where(e => e.Status == Domain.Enums.EventStatus.Scheduled || e.Status == Domain.Enums.EventStatus.Completed)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<Event> AddAsync(Event entity)
        {
            _context.Events.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(Event entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Event entity)
        {
            _context.Events.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Events.AnyAsync(e => e.Id == id);
        }
    }
}