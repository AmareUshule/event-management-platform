using EEP.EventManagement.Api.Application.Features.Reports.DTOs;
using EEP.EventManagement.Api.Application.Features.Reports.Queries;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Reports.Handlers
{
    public class GetReportSummaryQueryHandler : IRequestHandler<GetReportSummaryQuery, ReportSummaryDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IUserContext _userContext;
        private readonly IDepartmentRepository _departmentRepository;

        public GetReportSummaryQueryHandler(
            IEventRepository eventRepository, 
            IUserContext userContext,
            IDepartmentRepository departmentRepository)
        {
            _eventRepository = eventRepository;
            _userContext = userContext;
            _departmentRepository = departmentRepository;
        }

        public async Task<ReportSummaryDto> Handle(GetReportSummaryQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            var roles = _userContext.GetRoles().ToList();
            var departmentId = _userContext.GetDepartmentId();

            if (roles.Contains("Admin") || roles.Contains("Manager"))
            {
                var allEvents = await _eventRepository.GetAllAsync();
                
                bool isCommManager = false;
                if (departmentId.HasValue)
                {
                    var dept = await _departmentRepository.GetByIdAsync(departmentId.Value);
                    if (dept != null && dept.Name == "Communication")
                    {
                        isCommManager = true;
                    }
                }
                
                var visibleEvents = allEvents.Where(e =>
                {
                    if (e.Status != EventStatus.Draft) return true;
                    
                    if (roles.Contains("Admin") || isCommManager) return true;
                    
                    if (e.DepartmentId == departmentId) return true;
                    if (e.CreatedBy == userId) return true;
                    
                    return false;
                }).ToList();

                return new ReportSummaryDto
                {
                    TotalEvents = visibleEvents.Count(),
                    DraftCount = visibleEvents.Count(e => e.Status == EventStatus.Draft),
                    ScheduledCount = visibleEvents.Count(e => e.Status == EventStatus.Scheduled),
                    OngoingCount = visibleEvents.Count(e => e.Status == EventStatus.Ongoing),
                    CompletedCount = visibleEvents.Count(e => e.Status == EventStatus.Completed),
                    CoveredCount = visibleEvents.Count(e => e.Status == EventStatus.Covered),
                    UncoveredCount = visibleEvents.Count(e => e.Status == EventStatus.Uncovered),
                    CancelledCount = visibleEvents.Count(e => e.Status == EventStatus.Cancelled),
                    PendingApprovalsCount = visibleEvents.Count(e => e.Status == EventStatus.Draft)
                };
            }
            
            if (roles.Contains("Cameraman") || roles.Contains("Expert"))
            {
                var assignedEvents = await _eventRepository.GetByEmployeeIdAsync(userId);

                return new ReportSummaryDto
                {
                    TotalEvents = assignedEvents.Count(),
                    AssignedEventsCount = assignedEvents.Sum(e => e.Assignments.Count(a => a.EmployeeId == userId)),
                    ScheduledCount = assignedEvents.Count(e => e.Status == EventStatus.Scheduled),
                    OngoingCount = assignedEvents.Count(e => e.Status == EventStatus.Ongoing),
                    CompletedCount = assignedEvents.Count(e => e.Status == EventStatus.Completed),
                    CoveredCount = assignedEvents.Count(e => e.Status == EventStatus.Covered),
                    UncoveredCount = assignedEvents.Count(e => e.Status == EventStatus.Uncovered),
                    PendingAssignmentsCount = assignedEvents.Sum(e => e.Assignments.Count(a => a.EmployeeId == userId && a.Status == AssignmentStatus.Pending))
                };
            }

            return new ReportSummaryDto();
        }
    }
}
