using EEP.EventManagement.Api.Domain.Common;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class JobVacancy : BaseEntity
    {
        public Guid AnnouncementId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string JobCode { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public int RequiredNumber { get; set; }
        public string WorkPlace { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;
        public string Training { get; set; } = string.Empty;
        public string Certificate { get; set; } = string.Empty;
        public string OtherOptionalRequirements { get; set; } = string.Empty;
        public string WorkUnit { get; set; } = string.Empty; // Added based on frontend requirements
        
        // Navigation property
        public Announcement Announcement { get; set; } = null!;
    }
}
