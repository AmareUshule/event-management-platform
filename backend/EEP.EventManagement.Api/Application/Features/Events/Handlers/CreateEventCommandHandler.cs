using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, EventResponseDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateEventCommandHandler(IEventRepository eventRepository, IHttpContextAccessor httpContextAccessor)
        {
            _eventRepository = eventRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<EventResponseDto> Handle(CreateEventCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            var eventEntity = new Event
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                DepartmentId = request.DepartmentId,
                Status = EventStatus.Draft,
                CreatedBy = Guid.Parse(userId),
                EventPlace = request.EventPlace
            };

            await _eventRepository.AddAsync(eventEntity);

            return new EventResponseDto
            {
                Id = eventEntity.Id,
                Title = eventEntity.Title,
                Description = eventEntity.Description,
                StartDate = eventEntity.StartDate,
                EndDate = eventEntity.EndDate,
                DepartmentId = eventEntity.DepartmentId,
                Status = eventEntity.Status.ToString(),
                CreatedBy = eventEntity.CreatedBy
            };
        }
    }
}