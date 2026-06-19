using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using System.Threading.Tasks;
using EEP.EventManagement.Api.Application.Features.Reports.Queries;
using EEP.EventManagement.Api.Application.Features.Reports.DTOs;
using System.Text;
using System;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require basic auth for all
    public class ReportsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuthorizationService _authorizationService;

        public ReportsController(IMediator mediator, IAuthorizationService authorizationService)
        {
            _mediator = mediator;
            _authorizationService = authorizationService;
        }

        [HttpGet("summary")]
        [Authorize(Roles = "Admin,Manager,Expert,Cameraman")]
        public async Task<ActionResult<ReportSummaryDto>> GetReportSummary()
        {
            var query = new GetReportSummaryQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("staff-workload")]
        [Authorize]
        public async Task<ActionResult<List<StaffWorkloadDto>>> GetStaffWorkload(
            [FromQuery] DateTime? startDate, 
            [FromQuery] DateTime? endDate, 
            [FromQuery] string? role,
            [FromQuery] Guid? staffId)
        {
            // Allow Admin, Manager or Communication Manager (use existing policy)
            var isAdmin = User.IsInRole("Admin");
            var isManager = User.IsInRole("Manager");
            var isCommunicationManagerAuth = await _authorizationService.AuthorizeAsync(User, null, Infrastructure.Security.Authorization.AuthorizationPolicies.IsCommunicationManager);

            if (!isAdmin && !isManager && !isCommunicationManagerAuth.Succeeded)
            {
                return Forbid();
            }

            var query = new GetStaffWorkloadQuery 
            { 
                StartDate = startDate, 
                EndDate = endDate, 
                Role = role,
                StaffId = staffId
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("summary/export")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> ExportReportSummary()
        {
            var query = new GetReportSummaryQuery();
            var result = await _mediator.Send(query);

            var csv = new StringBuilder();
            csv.AppendLine("Category,Count");
            csv.AppendLine($"Total Events,{result.TotalEvents}");
            csv.AppendLine($"Drafts,{result.DraftCount}");
            csv.AppendLine($"Scheduled,{result.ScheduledCount}");
            csv.AppendLine($"Ongoing,{result.OngoingCount}");
            csv.AppendLine($"Completed,{result.CompletedCount}");
            csv.AppendLine($"Covered,{result.CoveredCount}");
            csv.AppendLine($"Uncovered,{result.UncoveredCount}");
            csv.AppendLine($"Cancelled,{result.CancelledCount}");
            csv.AppendLine($"Pending Approvals,{result.PendingApprovalsCount}");

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"EventSummary_{DateTime.UtcNow:yyyyMMdd}.csv");
        }
    }
}
