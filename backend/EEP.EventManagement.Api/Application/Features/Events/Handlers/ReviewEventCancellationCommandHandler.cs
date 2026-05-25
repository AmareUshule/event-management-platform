using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class ReviewEventCancellationCommandHandler : IRequestHandler<ReviewEventCancellationCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public ReviewEventCancellationCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(ReviewEventCancellationCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            if (ev.CancellationRequestStatus != CancellationRequestStatus.Pending)
            {
                throw new BadRequestException("There is no pending cancellation request for this event.");
            }

            // Check authorization: Admin or Manager (Communication Manager)
            var roles = _userContext.GetRoles();
            if (!_userContext.IsInRole("Admin") && !roles.Contains("Manager"))
            {
                throw new UnauthorizedException("Only an admin or manager can review cancellation requests.");
            }

            var userId = _userContext.GetUserId();
            ev.CancellationReviewedBy = userId;
            ev.CancellationReviewedAt = DateTime.UtcNow;
            ev.CancellationReviewComment = string.IsNullOrWhiteSpace(request.ReviewComment)
                ? null
                : request.ReviewComment.Trim();
            ev.UpdatedAt = DateTime.UtcNow;

            if (request.Approved)
            {
                if (ev.Status == EventStatus.Archived || ev.Status == EventStatus.Completed || ev.Status == EventStatus.Cancelled)
                {
                    throw new BadRequestException($"Events in {ev.Status} status cannot be cancelled.");
                }

                ev.CancellationRequestStatus = CancellationRequestStatus.Approved;
                ev.Status = EventStatus.Cancelled;
                ev.ClosureComment = ev.CancellationReason;
                ev.FinalizedBy = userId;
            }
            else
            {
                ev.CancellationRequestStatus = CancellationRequestStatus.Rejected;
            }

            await _eventRepository.UpdateAsync(ev);

            var updatedEv = await _eventRepository.GetByIdAsync(ev.Id);
            return _mapper.Map<EventDto>(updatedEv)!;
        }
    }
}
