using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Notification : BaseEntity
    {
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public Guid? ReferenceId { get; set; } // EventId or AnnouncementId
        public bool IsRead { get; set; } = false;

        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
    }
}
