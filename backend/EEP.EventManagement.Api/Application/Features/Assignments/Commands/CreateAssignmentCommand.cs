using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Commands
{
    public class CreateAssignmentCommand : IRequest<AssignmentDto>
    {
        public CreateAssignmentDto CreateAssignmentDto { get; set; } = null!;
    }
}
