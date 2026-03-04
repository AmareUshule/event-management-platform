using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Commands
{
    public class UpdateAssignmentStatusCommand : IRequest<AssignmentDto>
    {
        public UpdateAssignmentStatusDto UpdateAssignmentStatusDto { get; set; } = null!;
    }
}
