using EEP.EventManagement.Api.Application.Features.Notifications.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Services
{
    public interface INotificationService
    {
        Task SendNotificationAsync(Guid userId, string title, string message, NotificationType type, Guid? referenceId = null);
        Task SendToRoleAsync(string roleName, string title, string message, NotificationType type, Guid? referenceId = null);
        Task SendToAllAsync(string title, string message, NotificationType type, Guid? referenceId = null);
        Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId);
        Task<List<NotificationDto>> GetUnreadNotificationsAsync(Guid userId);
        Task MarkAsReadAsync(Guid notificationId);
        Task<int> GetUnreadCountAsync(Guid userId);
    }
}
