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
    public class MediaFileRepository : IMediaFileRepository
    {
        private readonly ApplicationDbContext _context;

        public MediaFileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MediaFile> GetByIdAsync(Guid id)
        {
            return await _context.MediaFiles
                .Include(m => m.Event)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<MediaFile>> GetByEventIdAsync(Guid eventId)
        {
            return await _context.MediaFiles
                .Where(m => m.EventId == eventId)
                .ToListAsync();
        }

        public async Task<MediaFile> AddAsync(MediaFile entity)
        {
            _context.MediaFiles.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(MediaFile entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(MediaFile entity)
        {
            _context.MediaFiles.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
