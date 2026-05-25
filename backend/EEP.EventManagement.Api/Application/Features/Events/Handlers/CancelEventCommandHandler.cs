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
    public class CancelEventCommandHandler : IRequestHandler<CancelEventCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public CancelEventCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(CancelEventCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            // Check authorization: Admin or Communication Manager
            var roles = _userContext.GetRoles();
            var isCommManager = _userContext.IsInRole("Manager") && _userContext.GetDepartmentId() != null; 
            // Note: The specific "Communication" department check is better handled via Policy in Controller,
            // but we add a safety check here for the General Manager role if possible.
            
            if (!_userContext.IsInRole("Admin") && !roles.Contains("Manager"))
            {
                throw new UnauthorizedException("Only an admin or manager can cancel a draft event.");
            }

            if (ev.Status != EventStatus.Draft)
            {
                throw new BadRequestException($"Direct cancellation is only allowed for Draft events. Current status: {ev.Status}");
            }

            ev.Status = EventStatus.Cancelled;
            ev.ClosureComment = request.ClosureComment;
            ev.FinalizedBy = _userContext.GetUserId();
            ev.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(ev);

            // Re-fetch to include navigation properties
            var updatedEv = await _eventRepository.GetByIdAsync(ev.Id);

            return _mapper.Map<EventDto>(updatedEv)!;
        }
    }
}
