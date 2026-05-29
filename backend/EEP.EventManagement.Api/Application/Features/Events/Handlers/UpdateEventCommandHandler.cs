using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Exceptions;
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

            // Check if date or location is changing for history tracking
            bool dateChanged = eventToUpdate.StartDate != request.UpdateEventDto.StartDate || 
                               eventToUpdate.EndDate != request.UpdateEventDto.EndDate;
            bool locationChanged = eventToUpdate.EventPlace != request.UpdateEventDto.EventPlace;

            if (dateChanged || locationChanged)
            {
                var userName = _userContext.IsInRole("Admin") ? "Administrator" : "Manager";
                var timestamp = DateTime.UtcNow.ToString("MMM dd, yyyy HH:mm");
                var historyEntry = $"[{timestamp}] {userName} DIRECTLY UPDATED schedule: ";
                
                if (dateChanged) historyEntry += $"Date: {eventToUpdate.StartDate:g} -> {request.UpdateEventDto.StartDate:g}. ";
                if (locationChanged) historyEntry += $"Location: {eventToUpdate.EventPlace} -> {request.UpdateEventDto.EventPlace}. ";

                eventToUpdate.ScheduleHistory = string.IsNullOrEmpty(eventToUpdate.ScheduleHistory) 
                    ? historyEntry 
                    : $"{historyEntry}\n{eventToUpdate.ScheduleHistory}";
            }

            _mapper.Map(request.UpdateEventDto, eventToUpdate);
            
            eventToUpdate.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.UpdateAsync(eventToUpdate);

            // Re-fetch to include navigation properties
            var updatedEvent = await _eventRepository.GetByIdAsync(eventToUpdate.Id);

            return _mapper.Map<EventDto>(updatedEvent);
        }
    }
}