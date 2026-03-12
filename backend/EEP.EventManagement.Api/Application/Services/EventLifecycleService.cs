using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Services
{
    public interface IEventLifecycleService
    {
        Task ProcessAutomaticTransitionsAsync();
    }

    public class EventLifecycleService : IEventLifecycleService
    {
        private readonly ApplicationDbContext _dbContext;

        public EventLifecycleService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task ProcessAutomaticTransitionsAsync()
        {
            var now = DateTime.UtcNow;

            // Transition SCHEDULED -> ONGOING
            var scheduledEvents = await _dbContext.Events
                .Where(e => e.Status == EventStatus.Scheduled && e.StartDate <= now)
                .ToListAsync();

            foreach (var ev in scheduledEvents)
            {
                ev.Status = EventStatus.Ongoing;
            }

            // Transition ONGOING -> COMPLETED
            var ongoingEvents = await _dbContext.Events
                .Where(e => e.Status == EventStatus.Ongoing && e.EndDate <= now)
                .ToListAsync();

            foreach (var ev in ongoingEvents)
            {
                ev.Status = EventStatus.Completed;
            }

            if (scheduledEvents.Any() || ongoingEvents.Any())
            {
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
