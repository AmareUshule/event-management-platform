using EEP.EventManagement.Api.Application.Features.Reports.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Reports.Queries
{
    public class GetReportSummaryQuery : IRequest<ReportSummaryDto>
    {
    }
}
