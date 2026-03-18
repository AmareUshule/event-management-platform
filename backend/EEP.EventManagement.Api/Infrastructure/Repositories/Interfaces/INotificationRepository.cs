using EEP.EventManagement.Api.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(Guid id);
        Task<List<Notification>> GetUserNotificationsAsync(Guid userId);
        Task<List<Notification>> GetUnreadUserNotificationsAsync(Guid userId);
        Task<Notification> AddAsync(Notification notification);
        Task UpdateAsync(Notification notification);
        Task<int> GetUnreadCountAsync(Guid userId);
    }
}
