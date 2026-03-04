using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Commands
{
    public class BulkAssignStaffCommand : IRequest<List<AssignmentDto>>
    {
        public BulkAssignStaffDto BulkAssignStaffDto { get; set; } = null!;
    }
}
