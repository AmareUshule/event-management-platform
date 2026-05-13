using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Notifications.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Notifications.Hubs;
using EEP.EventManagement.Api.Infrastructure.Notifications.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository notificationRepository,
            IHubContext<NotificationHub> hubContext,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            IEmailSender emailSender,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _hubContext = hubContext;
            _mapper = mapper;
            _userManager = userManager;
            _emailSender = emailSender;
            _logger = logger;
        }

        public async Task SendNotificationAsync(Guid userId, string title, string message, NotificationType type, Guid? referenceId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                ReferenceId = referenceId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);

            var dto = _mapper.Map<NotificationDto>(notification);
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", dto);

            await SendEmailNotificationAsync(userId, title, message);
        }

        public async Task SendToRoleAsync(string roleName, string title, string message, NotificationType type, Guid? referenceId = null)
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);
            foreach (var user in usersInRole)
            {
                await SendNotificationAsync(user.Id, title, message, type, referenceId);
            }
        }

        public async Task SendToAllAsync(string title, string message, NotificationType type, Guid? referenceId = null)
        {
            // Note: This could be slow for many users. In a real app, use a background job or a more efficient way.
            var users = await _userManager.Users.ToListAsync();
            foreach (var user in users)
            {
                await SendNotificationAsync(user.Id, title, message, type, referenceId);
            }
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId)
        {
            var notifications = await _notificationRepository.GetUserNotificationsAsync(userId);
            return _mapper.Map<List<NotificationDto>>(notifications);
        }

        public async Task<List<NotificationDto>> GetUnreadNotificationsAsync(Guid userId)
        {
            var notifications = await _notificationRepository.GetUnreadUserNotificationsAsync(userId);
            return _mapper.Map<List<NotificationDto>>(notifications);
        }

        public async Task MarkAsReadAsync(Guid notificationId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                notification.UpdatedAt = DateTime.UtcNow;
                await _notificationRepository.UpdateAsync(notification);
            }
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        private async Task SendEmailNotificationAsync(Guid userId, string title, string message)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null || string.IsNullOrWhiteSpace(user.Email))
                {
                    _logger.LogDebug("Email notification skipped because user {UserId} has no email address.", userId);
                    return;
                }

                await _emailSender.SendAsync(user.Email, title, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email notification to user {UserId}.", userId);
            }
        }
    }
}
