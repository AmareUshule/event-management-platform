using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        public string? EventPlace { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventStatus Status { get; set; } = EventStatus.Draft;
        public Guid CreatedBy { get; set; }
        public Guid? ApprovedBy { get; set; }
        public string? ClosureComment { get; set; }
        public Guid? FinalizedBy { get; set; }
        public CancellationRequestStatus CancellationRequestStatus { get; set; } = CancellationRequestStatus.None;
        public string? CancellationReason { get; set; }
        public Guid? CancellationRequestedBy { get; set; }
        public DateTime? CancellationRequestedAt { get; set; }
        public Guid? CancellationReviewedBy { get; set; }
        public DateTime? CancellationReviewedAt { get; set; }
        public string? CancellationReviewComment { get; set; }

        public DateChangeRequestStatus DateChangeRequestStatus { get; set; } = DateChangeRequestStatus.None;
        public DateTime? ProposedStartDate { get; set; }
        public DateTime? ProposedEndDate { get; set; }
        public string? ProposedEventPlace { get; set; }
        public string? DateChangeReason { get; set; }
        public Guid? DateChangeRequestedBy { get; set; }
        public DateTime? DateChangeRequestedAt { get; set; }
        public Guid? DateChangeReviewedBy { get; set; }
        public DateTime? DateChangeReviewedAt { get; set; }
        public string? DateChangeReviewComment { get; set; }

        // Navigation properties
        public Department Department { get; set; } = null!;
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser CreatedByUser { get; set; } = null!;
        
        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("ApprovedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? ApprovedByUser { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("FinalizedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? FinalizedByUser { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("CancellationRequestedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? CancellationRequestedByUser { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("CancellationReviewedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? CancellationReviewedByUser { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("DateChangeRequestedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? DateChangeRequestedByUser { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("DateChangeReviewedBy")]
        public EEP.EventManagement.Api.Infrastructure.Security.Identity.ApplicationUser? DateChangeReviewedByUser { get; set; }

        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
        public ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();
    }
}
