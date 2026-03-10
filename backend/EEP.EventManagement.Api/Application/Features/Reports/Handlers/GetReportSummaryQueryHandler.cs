using EEP.EventManagement.Api.Application.Features.Reports.DTOs;
using EEP.EventManagement.Api.Application.Features.Reports.Queries;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Reports.Handlers
{
    public class GetReportSummaryQueryHandler : IRequestHandler<GetReportSummaryQuery, ReportSummaryDto>
    {
        private readonly IEventRepository _eventRepository;

        public GetReportSummaryQueryHandler(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<ReportSummaryDto> Handle(GetReportSummaryQuery request, CancellationToken cancellationToken)
        {
            var events = await _eventRepository.GetAllAsync();

            return new ReportSummaryDto
            {
                TotalEvents = events.Count,
                DraftCount = events.Count(e => e.Status == EventStatus.Draft),
                ScheduledCount = events.Count(e => e.Status == EventStatus.Scheduled),
                OngoingCount = events.Count(e => e.Status == EventStatus.Ongoing),
                CompletedCount = events.Count(e => e.Status == EventStatus.Completed),
                ArchivedCount = events.Count(e => e.Status == EventStatus.Archived),
                CancelledCount = events.Count(e => e.Status == EventStatus.Cancelled),
                // Assuming pending approvals means events that are Draft and submitted?
                // Wait, if Draft means it's not approved yet, maybe that's it.
                // Or maybe there's a specific status for "Submitted".
                // Looking at EventStatus: Draft, Scheduled, Ongoing, Completed, Archived, Cancelled.
                // Let's assume Drafts are pending if they are not approved.
                PendingApprovalsCount = events.Count(e => e.Status == EventStatus.Draft && e.ApprovedBy == null)
            };
        }
    }
}
