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
    public class RequestEventDateChangeCommandHandler : IRequestHandler<RequestEventDateChangeCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public RequestEventDateChangeCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(RequestEventDateChangeCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            // Only allow requests for Scheduled events
            if (ev.Status != EventStatus.Scheduled)
            {
                throw new BadRequestException("Date/location change requests can only be made for Scheduled events.");
            }

            // Only allow creators to request changes
            if (ev.CreatedBy != _userContext.GetUserId() && !_userContext.IsInRole("Admin"))
            {
                throw new UnauthorizedException("Only the event creator or an Admin can request date/location changes.");
            }

            // Ensure there isn't a pending request already
            if (ev.DateChangeRequestStatus == DateChangeRequestStatus.Pending)
            {
                throw new BadRequestException("There is already a pending date/location change request for this event.");
            }

            ev.ProposedStartDate = request.ProposedStartDate;
            ev.ProposedEndDate = request.ProposedEndDate;
            ev.ProposedEventPlace = request.ProposedEventPlace;
            ev.DateChangeReason = request.Reason;
            ev.DateChangeRequestStatus = DateChangeRequestStatus.Pending;
            ev.DateChangeRequestedBy = _userContext.GetUserId();
            ev.DateChangeRequestedAt = DateTime.UtcNow;
            ev.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(ev);

            // Re-fetch to include navigation properties
            var updatedEv = await _eventRepository.GetByIdAsync(ev.Id);

            return _mapper.Map<EventDto>(updatedEv)!;
        }
    }
}