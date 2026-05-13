using EEP.EventManagement.Api.Application.Features.Reports.DTOs;
using MediatR;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Reports.Queries
{
    public class GetStaffWorkloadQuery : IRequest<List<StaffWorkloadDto>>
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Role { get; set; } // Expert or Cameraman
        public Guid? StaffId { get; set; }
    }
}
