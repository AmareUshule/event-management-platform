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
    public class VerifyCoverageCommandHandler : IRequestHandler<VerifyCoverageCommand, AssignmentDto>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;
        private readonly INotificationService _notificationService;

        public VerifyCoverageCommandHandler(
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

        public async Task<AssignmentDto> Handle(VerifyCoverageCommand request, CancellationToken cancellationToken)
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

            var ev = await _eventRepository.GetByIdAsync(assignment.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", assignment.EventId);
            }

            var currentUserId = _userContext.GetUserId();
            // Only the creator of the event (Department Manager) or Admin can verify
            // For now, let's stick to Creator.
            if (ev.CreatedBy != currentUserId && !_userContext.IsInRole("Admin"))
            {
                throw new UnauthorizedException("Only the event creator or an administrator can verify coverage.");
            }

            if (assignment.Status != AssignmentStatus.Submitted)
            {
                throw new BadRequestException("Only submitted assignments can be verified.");
            }

            if (request.IsApproved)
            {
                assignment.Status = AssignmentStatus.VerifiedByCreator;
            }
            else
            {
                assignment.Status = AssignmentStatus.RevisionRequested;
                if (string.IsNullOrWhiteSpace(request.Note))
                {
                    throw new BadRequestException("A note must be provided when requesting revisions.");
                }
            }

            assignment.VerificationNote = request.Note;
            assignment.VerifiedAt = DateTime.UtcNow;
            assignment.VerifiedById = currentUserId;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _assignmentRepository.UpdateAsync(assignment);

            // Notify the assigned staff member
            var statusText = request.IsApproved ? "verified" : "sent back for revision";
            await _notificationService.SendNotificationAsync(
                assignment.EmployeeId,
                $"Coverage {statusText}",
                $"Your coverage for event '{ev.Title}' has been {statusText} by the requestor.",
                NotificationType.Assignment,
                assignment.EventId
            );

            var updatedAssignment = await _assignmentRepository.GetByIdAsync(assignment.Id);
            return _mapper.Map<AssignmentDto>(updatedAssignment);
        }
    }
}
