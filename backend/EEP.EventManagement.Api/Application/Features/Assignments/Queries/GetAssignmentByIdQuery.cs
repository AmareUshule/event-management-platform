using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Queries
{
    public class GetAssignmentByIdQuery : IRequest<AssignmentDto>
    {
        public Guid Id { get; set; }
    }
}
