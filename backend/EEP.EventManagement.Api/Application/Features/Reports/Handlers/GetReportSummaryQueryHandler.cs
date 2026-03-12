using EEP.EventManagement.Api.Application.Features.Reports.DTOs;
using EEP.EventManagement.Api.Application.Features.Reports.Queries;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Reports.Handlers
{
    public class GetReportSummaryQueryHandler : IRequestHandler<GetReportSummaryQuery, ReportSummaryDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IUserContext _userContext;

        public GetReportSummaryQueryHandler(IEventRepository eventRepository, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _userContext = userContext;
        }

        public async Task<ReportSummaryDto> Handle(GetReportSummaryQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            var roles = _userContext.GetRoles().ToList();

            if (roles.Contains("Admin") || roles.Contains("Manager"))
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
                    PendingApprovalsCount = events.Count(e => e.Status == EventStatus.Submitted)
                };
            }
            
            if (roles.Contains("Cameraman") || roles.Contains("Expert"))
            {
                var assignedEvents = await _eventRepository.GetByEmployeeIdAsync(userId);

                return new ReportSummaryDto
                {
                    TotalEvents = assignedEvents.Count,
                    AssignedEventsCount = assignedEvents.Sum(e => e.Assignments.Count(a => a.EmployeeId == userId)),
                    ScheduledCount = assignedEvents.Count(e => e.Status == EventStatus.Scheduled),
                    OngoingCount = assignedEvents.Count(e => e.Status == EventStatus.Ongoing),
                    CompletedCount = assignedEvents.Count(e => e.Status == EventStatus.Completed),
                    ArchivedCount = assignedEvents.Count(e => e.Status == EventStatus.Archived),
                    PendingAssignmentsCount = assignedEvents.Sum(e => e.Assignments.Count(a => a.EmployeeId == userId && a.Status == AssignmentStatus.Pending))
                };
            }

            return new ReportSummaryDto();
        }
    }
}
