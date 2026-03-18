namespace EEP.EventManagement.Api.Application.Features.Reports.DTOs
{
    public class ReportSummaryDto
    {
        public int TotalEvents { get; set; }
        public int DraftCount { get; set; }
        public int ScheduledCount { get; set; }
        public int OngoingCount { get; set; }
        public int CompletedCount { get; set; }
        public int ArchivedCount { get; set; }
        public int CancelledCount { get; set; }
        public int PendingApprovalsCount { get; set; }
        public int AssignedEventsCount { get; set; }
        public int PendingAssignmentsCount { get; set; }
    }
}
