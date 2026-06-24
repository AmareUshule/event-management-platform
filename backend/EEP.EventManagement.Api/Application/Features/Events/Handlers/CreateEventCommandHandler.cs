using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Identity;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using System.Linq;
using Microsoft.EntityFrameworkCore; // Eagerly load navigation properties

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, EventDto>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;
        private readonly UserManager<ApplicationUser> _userManager;

        public CreateEventCommandHandler(
            IEventRepository eventRepository,
            IDepartmentRepository departmentRepository,
            IMapper mapper,
            IUserContext userContext,
            UserManager<ApplicationUser> userManager)
        {
            _eventRepository = eventRepository;
            _departmentRepository = departmentRepository;
            _mapper = mapper;
            _userContext = userContext;
            _userManager = userManager;
        }

        public async Task<EventDto> Handle(CreateEventCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            // Eagerly load the Department navigation property to ensure it's available for the 72-hour rule check.
            var user = await _userManager.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            if (user == null || user.DepartmentId == null)
            {
                throw new BadRequestException("Creator's department not found. Cannot create event.");
            }

            var @event = _mapper.Map<Event>(request.CreateEventDto);
            
            @event.CreatedAt = DateTime.UtcNow;
            @event.CreatedBy = userId;

            // 72-hour Rule Implementation
            var roles = _userContext.GetRoles();
            var isAdmin = roles.Contains("Admin");
            var isCommManager = roles.Contains("Manager") && user.Department?.Name == "Communication";
            var isCommStaff = user.Department?.Name == "Communication";

            if (!isAdmin && !isCommManager && !isCommStaff)
            {
                var minAllowedStartDate = DateTime.UtcNow.AddHours(72);
                if (request.CreateEventDto.StartDate < minAllowedStartDate)
                {
                    throw new BadRequestException("Events must be scheduled at least 72 hours in advance. Only the Communication department and Administrators can create urgent events.");
                }
            }
            
            // If department ID is provided in DTO, use it; otherwise, use creator's department
            if (request.CreateEventDto.DepartmentId.HasValue && request.CreateEventDto.DepartmentId.Value != Guid.Empty)
            {
                var department = await _departmentRepository.GetByIdAsync(request.CreateEventDto.DepartmentId.Value);
                if (department == null)
                {
                    throw new BadRequestException($"Unknown department id: {request.CreateEventDto.DepartmentId}");
                }
                @event.DepartmentId = request.CreateEventDto.DepartmentId.Value;
            }
            else
            {
                @event.DepartmentId = user.DepartmentId.Value; // Assign creator's departmentId
            }

            @event = await _eventRepository.AddAsync(@event);

            // Fetch the event again to include navigation properties for the response DTO
            var createdEventWithDetails = await _eventRepository.GetByIdAsync(@event.Id);
            if (createdEventWithDetails == null)
            {
                throw new NotFoundException($"Newly created event with ID {@event.Id} could not be retrieved.");
            }

            return _mapper.Map<EventDto>(createdEventWithDetails);
        }
    }
}