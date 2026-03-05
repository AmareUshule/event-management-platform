using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Queries
{
    public class GetAssignmentsByEventQuery : IRequest<List<AssignmentDto>>
    {
        public Guid EventId { get; set; }
    }
}
