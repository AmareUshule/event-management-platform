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

            ev.Status = EventStatus.Archived;
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
