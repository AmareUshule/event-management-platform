using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class ReviewEventDateChangeCommandHandler : IRequestHandler<ReviewEventDateChangeCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public ReviewEventDateChangeCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(ReviewEventDateChangeCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            // Only allow Comm Managers and Admins to review
            var isCommManager = _userContext.HasClaim("Permission", "IsCommunicationManager");
            if (!(_userContext.IsInRole("Admin") || isCommManager))
            {
                throw new UnauthorizedException("Only Communication Managers or Admins can review date/location change requests.");
            }

            // Ensure there is a pending request to review
            if (ev.DateChangeRequestStatus != DateChangeRequestStatus.Pending)
            {
                throw new BadRequestException("There is no pending date/location change request for this event to review.");
            }

            var reviewerName = _userContext.IsInRole("Admin") ? "Administrator" : "Communication Manager";
            var timestamp = DateTime.UtcNow.ToString("MMM dd, yyyy HH:mm");
            var historyEntry = "";

            if (request.Approved)
            {
                if (!ev.ProposedStartDate.HasValue || !ev.ProposedEndDate.HasValue || string.IsNullOrWhiteSpace(ev.ProposedEventPlace))
                {
                    throw new BadRequestException("Proposed date/location details are missing for approval.");
                }

                historyEntry = $"[{timestamp}] {reviewerName} APPROVED change: " +
                               $"Date: {ev.StartDate:g} -> {ev.ProposedStartDate.Value:g}, " +
                               $"Location: {ev.EventPlace} -> {ev.ProposedEventPlace}. " +
                               $"Comment: {request.ReviewComment}";

                ev.StartDate = ev.ProposedStartDate.Value;
                ev.EndDate = ev.ProposedEndDate.Value;
                ev.EventPlace = ev.ProposedEventPlace;
                ev.DateChangeRequestStatus = DateChangeRequestStatus.Approved;
            }
            else
            {
                historyEntry = $"[{timestamp}] {reviewerName} REJECTED change request. Reason: {request.ReviewComment}";
                ev.DateChangeRequestStatus = DateChangeRequestStatus.Rejected;
            }

            ev.ScheduleHistory = string.IsNullOrEmpty(ev.ScheduleHistory) 
                ? historyEntry 
                : $"{historyEntry}\n{ev.ScheduleHistory}";

            ev.DateChangeReviewComment = request.ReviewComment;
            ev.DateChangeReviewedBy = _userContext.GetUserId();
            ev.DateChangeReviewedAt = DateTime.UtcNow;
            ev.UpdatedAt = DateTime.UtcNow;

            // Clear proposed values after review, regardless of outcome
            ev.ProposedStartDate = null;
            ev.ProposedEndDate = null;
            ev.ProposedEventPlace = null;
            
            await _eventRepository.UpdateAsync(ev);

            // Re-fetch to include navigation properties
            var updatedEv = await _eventRepository.GetByIdAsync(ev.Id);

            return _mapper.Map<EventDto>(updatedEv)!;
        }
    }
}