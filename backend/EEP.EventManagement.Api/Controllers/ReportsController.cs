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
    [Authorize(Roles = "Admin,Manager,Expert,Cameraman")] // All actions in this controller require authorization
    public class ReportsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<ReportSummaryDto>> GetReportSummary()
        {
            var query = new GetReportSummaryQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("summary/export")]
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
            csv.AppendLine($"Archived,{result.ArchivedCount}");
            csv.AppendLine($"Cancelled,{result.CancelledCount}");
            csv.AppendLine($"Pending Approvals,{result.PendingApprovalsCount}");

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"EventSummary_{DateTime.UtcNow:yyyyMMdd}.csv");
        }
    }
}
