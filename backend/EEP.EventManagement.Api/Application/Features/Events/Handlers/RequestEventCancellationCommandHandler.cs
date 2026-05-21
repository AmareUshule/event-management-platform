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
    public class RequestEventCancellationCommandHandler : IRequestHandler<RequestEventCancellationCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public RequestEventCancellationCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(RequestEventCancellationCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            var userId = _userContext.GetUserId();
            if (!_userContext.IsInRole("Admin") && ev.CreatedBy != userId)
            {
                throw new UnauthorizedException("Only the event creator or an admin can request cancellation.");
            }

            if (ev.Status == EventStatus.Archived || ev.Status == EventStatus.Completed || ev.Status == EventStatus.Cancelled)
            {
                throw new BadRequestException($"Events in {ev.Status} status cannot be cancelled.");
            }

            if (ev.CancellationRequestStatus == CancellationRequestStatus.Pending)
            {
                throw new BadRequestException("A cancellation request is already pending for this event.");
            }

            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                throw new BadRequestException("Cancellation reason is required.");
            }

            ev.CancellationRequestStatus = CancellationRequestStatus.Pending;
            ev.CancellationReason = request.Reason.Trim();
            ev.CancellationRequestedBy = userId;
            ev.CancellationRequestedAt = DateTime.UtcNow;
            ev.CancellationReviewedBy = null;
            ev.CancellationReviewedAt = null;
            ev.CancellationReviewComment = null;
            ev.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(ev);

            var updatedEv = await _eventRepository.GetByIdAsync(ev.Id);
            return _mapper.Map<EventDto>(updatedEv)!;
        }
    }
}
