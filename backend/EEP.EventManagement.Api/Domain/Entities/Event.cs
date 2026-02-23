using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventStatus Status { get; set; }
        public Guid CreatedBy { get; set; }
        public Guid? ApprovedBy { get; set; }
        public string EventPlace { get; set; } = string.Empty;

        // Navigation properties
        public Department? Department { get; set; }
        public ApplicationUser? CreatedByUser { get; set; }
        public ApplicationUser? ApprovedByUser { get; set; }

        // Navigation property for MediaFiles
        public ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();

        // Navigation property for Assignments
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}