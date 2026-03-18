using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Implementations
{
    public class AnnouncementRepository : IAnnouncementRepository
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Announcement?> GetByIdAsync(Guid id, bool includeMediaAndJobs = false)
        {
            var query = _context.Announcements
                .Include(a => a.CreatedByUser)
                .Include(a => a.ApprovedByUser)
                .Include(a => a.Department)
                .AsQueryable();

            if (includeMediaAndJobs)
            {
                query = query.Include(a => a.Media)
                             .Include(a => a.JobVacancies);
            }

            return await query.FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<(List<Announcement> Items, int TotalCount)> GetPagedAsync(AnnouncementStatus? status, Guid? createdById, int page, int pageSize)
        {
            var query = _context.Announcements.AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(a => a.Status == status.Value);
            }

            if (createdById.HasValue)
            {
                query = query.Where(a => a.CreatedBy == createdById.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .Include(a => a.CreatedByUser)
                .Include(a => a.ApprovedByUser)
                .Include(a => a.Department)
                .Include(a => a.Media) // Include Media
                .Include(a => a.JobVacancies) // Include JobVacancies
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Announcement> AddAsync(Announcement entity)
        {
            _context.Announcements.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(Announcement entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Announcement entity)
        {
            _context.Announcements.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Announcements.AnyAsync(a => a.Id == id);
        }

        public async Task AddMediaAsync(AnnouncementMedia media)
        {
            _context.AnnouncementMedia.Add(media);
            await _context.SaveChangesAsync();
        }
    }
}
