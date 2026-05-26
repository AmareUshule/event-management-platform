using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Assignments.Commands;
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using EEP.EventManagement.Api.Application.Services;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Handlers
{
    public class SubmitCoverageCommandHandler : IRequestHandler<SubmitCoverageCommand, AssignmentDto>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;
        private readonly INotificationService _notificationService;

        public SubmitCoverageCommandHandler(
            IAssignmentRepository assignmentRepository,
            IEventRepository eventRepository,
            IMapper mapper,
            IUserContext userContext,
            INotificationService notificationService)
        {
            _assignmentRepository = assignmentRepository;
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
            _notificationService = notificationService;
        }

        public async Task<AssignmentDto> Handle(SubmitCoverageCommand request, CancellationToken cancellationToken)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
            {
                throw new NotFoundException("Assignment", request.AssignmentId);
            }

            if (assignment.EventId != request.EventId)
            {
                throw new BadRequestException("Assignment does not belong to the specified event.");
            }

            var currentUserId = _userContext.GetUserId();
            if (assignment.EmployeeId != currentUserId)
            {
                throw new UnauthorizedException("You are not authorized to submit coverage for this assignment.");
            }

            if (assignment.Status != AssignmentStatus.Accepted && assignment.Status != AssignmentStatus.RevisionRequested)
            {
                throw new BadRequestException("Coverage can only be submitted for accepted assignments or requested revisions.");
            }

            assignment.Status = AssignmentStatus.Submitted;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _assignmentRepository.UpdateAsync(assignment);

            // Notify the event creator (Department Manager)
            var ev = await _eventRepository.GetByIdAsync(assignment.EventId);
            if (ev != null)
            {
                var employeeName = assignment.Employee != null 
                    ? $"{assignment.Employee.FirstName} {assignment.Employee.LastName}" 
                    : "An employee";

                await _notificationService.SendNotificationAsync(
                    ev.CreatedBy,
                    "Coverage Submitted",
                    $"{employeeName} has submitted coverage for event: {ev.Title}. Please verify in the personnel tab.",
                    NotificationType.Assignment,
                    assignment.EventId
                );
            }

            var updatedAssignment = await _assignmentRepository.GetByIdAsync(assignment.Id);
            return _mapper.Map<AssignmentDto>(updatedAssignment);
        }
    }
}
