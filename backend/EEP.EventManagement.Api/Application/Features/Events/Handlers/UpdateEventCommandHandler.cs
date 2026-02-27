using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public UpdateEventCommandHandler(IEventRepository eventRepository, IMapper mapper, IUserContext userContext)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<EventDto> Handle(UpdateEventCommand request, CancellationToken cancellationToken)
        {
            var eventToUpdate = await _eventRepository.GetByIdAsync(request.UpdateEventDto.Id);

            if (eventToUpdate == null)
            {
                throw new NotFoundException(nameof(Event), request.UpdateEventDto.Id);
            }
            
            _mapper.Map(request.UpdateEventDto, eventToUpdate);
            
            eventToUpdate.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(eventToUpdate);

            return _mapper.Map<EventDto>(eventToUpdate);
        }
    }
}