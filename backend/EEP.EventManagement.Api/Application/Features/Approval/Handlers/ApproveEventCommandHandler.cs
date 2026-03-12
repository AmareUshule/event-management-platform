using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Approval.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Approval.Handlers
{
    public class ApproveEventCommandHandler : IRequestHandler<ApproveEventCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public ApproveEventCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(ApproveEventCommand request, CancellationToken cancellationToken)
        {
            var eventToApprove = await _eventRepository.GetByIdAsync(request.EventId);

            if (eventToApprove == null)
            {
                throw new NotFoundException(nameof(Event), request.EventId);
            }

            if (eventToApprove.Status != EventStatus.Draft && eventToApprove.Status != EventStatus.Submitted)
            {
                throw new BadRequestException("Only draft or submitted events can be approved.");
            }

            eventToApprove.Status = EventStatus.Scheduled;
            eventToApprove.ApprovedBy = _userContext.GetUserId();
            eventToApprove.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(eventToApprove);

            // Re-fetch to include navigation properties (like ApprovedByUser)
            var updatedEvent = await _eventRepository.GetByIdAsync(eventToApprove.Id);

            return _mapper.Map<EventDto>(updatedEvent);
        }
    }
}
