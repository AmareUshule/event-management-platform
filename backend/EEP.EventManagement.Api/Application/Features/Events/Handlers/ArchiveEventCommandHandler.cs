using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class ArchiveEventCommandHandler : IRequestHandler<ArchiveEventCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly EEP.EventManagement.Api.Infrastructure.Security.Claims.IUserContext _userContext;

        public ArchiveEventCommandHandler(IEventRepository eventRepository, IMapper mapper, EEP.EventManagement.Api.Infrastructure.Security.Claims.IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(ArchiveEventCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            if (ev.Status != EventStatus.Completed)
            {
                throw new BadRequestException("Only completed events can be archived.");
            }

            // Check if all assignments are verified if override is not allowed
            if (!request.AllowOverride)
            {
                foreach (var assignment in ev.Assignments)
                {
                    if (assignment.Status == AssignmentStatus.Accepted || 
                        assignment.Status == AssignmentStatus.Submitted || 
                        assignment.Status == AssignmentStatus.RevisionRequested)
                    {
                        throw new BadRequestException($"Assignment for {assignment.Employee?.FirstName} {assignment.Employee?.LastName} is not yet verified by the creator.");
                    }
                }
            }

            // Update assignment final statuses and determine event coverage
            bool allCovered = true;
            foreach (var assignment in ev.Assignments)
            {
                if (assignment.Status == AssignmentStatus.VerifiedByCreator)
                {
                    assignment.Status = AssignmentStatus.Covered;
                }
                else if (request.AllowOverride && (assignment.Status == AssignmentStatus.Accepted || assignment.Status == AssignmentStatus.Submitted || assignment.Status == AssignmentStatus.RevisionRequested))
                {
                    assignment.Status = AssignmentStatus.Covered; // Communication Manager overrides
                }
                else if (assignment.Status == AssignmentStatus.Accepted || assignment.Status == AssignmentStatus.Pending || assignment.Status == AssignmentStatus.RevisionRequested)
                {
                    assignment.Status = AssignmentStatus.Uncovered; // Concluded without proper coverage
                    allCovered = false;
                }
            }

            ev.Status = allCovered ? EventStatus.Covered : EventStatus.Uncovered;
            ev.ClosureComment = request.ClosureComment;
            ev.FinalizedBy = _userContext.GetUserId();
            ev.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(ev);

            // Re-fetch to include navigation properties (like FinalizedByUser)
            var updatedEv = await _eventRepository.GetByIdAsync(ev.Id);

            return _mapper.Map<EventDto>(updatedEv)!;
        }
    }
}
