using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
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
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<Event>> GetAllAsync()
        {
            return await _context.Events
                .Include(e => e.Department)
                .Include(e => e.CreatedByUser)
                .Include(e => e.ApprovedByUser)
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