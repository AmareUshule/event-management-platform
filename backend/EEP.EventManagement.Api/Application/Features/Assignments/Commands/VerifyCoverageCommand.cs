using MediatR;
using System;
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Commands
{
    public class VerifyCoverageCommand : IRequest<AssignmentDto>
    {
        public Guid EventId { get; set; }
        public Guid AssignmentId { get; set; }
        public bool IsApproved { get; set; }
        public string? Note { get; set; }
    }
}
