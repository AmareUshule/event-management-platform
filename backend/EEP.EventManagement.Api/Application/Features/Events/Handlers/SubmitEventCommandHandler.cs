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
    public class SubmitEventCommandHandler : IRequestHandler<SubmitEventCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public SubmitEventCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(SubmitEventCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            if (ev.Status != EventStatus.Draft)
            {
                throw new BadRequestException("Only draft events can be submitted for approval.");
            }

            var userId = _userContext.GetUserId();
            if (ev.CreatedBy != userId && !_userContext.GetRoles().Contains("Admin"))
            {
                throw new UnauthorizedException("Only the creator can submit the event.");
            }

            ev.Status = EventStatus.Submitted;
            ev.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(ev);

            return _mapper.Map<EventDto>(ev);
        }
    }
}
