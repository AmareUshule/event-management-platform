using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Events.DTOs
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? EventPlace { get; set; }
        public string? CoverImageUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string TimeStatus { get; set; } = string.Empty;

        public SimplifiedDepartmentDto? Department { get; set; }
        public SimplifiedUserDto? CreatedBy { get; set; }
        public SimplifiedUserDto? ApprovedBy { get; set; }
        public SimplifiedUserDto? FinalizedBy { get; set; }
        public string? ClosureComment { get; set; }
        public string CancellationRequestStatus { get; set; } = "None";
        public string? CancellationReason { get; set; }
        public SimplifiedUserDto? CancellationRequestedBy { get; set; }
        public DateTime? CancellationRequestedAt { get; set; }
        public SimplifiedUserDto? CancellationReviewedBy { get; set; }
        public DateTime? CancellationReviewedAt { get; set; }
        public string? CancellationReviewComment { get; set; }
        public string DateChangeRequestStatus { get; set; } = "None";
        public DateTime? ProposedStartDate { get; set; }
        public DateTime? ProposedEndDate { get; set; }
        public string? ProposedEventPlace { get; set; }
        public string? DateChangeReason { get; set; }
        public SimplifiedUserDto? DateChangeRequestedBy { get; set; }
        public DateTime? DateChangeRequestedAt { get; set; }
        public SimplifiedUserDto? DateChangeReviewedBy { get; set; }
        public DateTime? DateChangeReviewedAt { get; set; }
        public string? DateChangeReviewComment { get; set; }
        public bool HasSubmittedAssignments { get; set; }
        public GroupedAssignmentsDto? Assignments { get; set; }
    }
}
