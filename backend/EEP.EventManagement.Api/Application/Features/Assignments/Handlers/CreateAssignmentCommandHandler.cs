using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Assignments.Commands;
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Handlers
{
    public class CreateAssignmentCommandHandler : IRequestHandler<CreateAssignmentCommand, AssignmentDto>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IEventRepository _eventRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public CreateAssignmentCommandHandler(
            IAssignmentRepository assignmentRepository,
            IEventRepository eventRepository,
            UserManager<ApplicationUser> userManager,
            IMapper mapper,
            IUserContext userContext)
        {
            _assignmentRepository = assignmentRepository;
            _eventRepository = eventRepository;
            _userManager = userManager;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AssignmentDto> Handle(CreateAssignmentCommand request, CancellationToken cancellationToken)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(request.CreateAssignmentDto.EventId);
            if (eventEntity == null)
            {
                throw new NotFoundException(nameof(Event), request.CreateAssignmentDto.EventId);
            }

            // Find employee by Guid or custom EmployeeId string
            ApplicationUser? employee = null;
            if (Guid.TryParse(request.CreateAssignmentDto.EmployeeId, out var employeeGuid))
            {
                employee = await _userManager.FindByIdAsync(employeeGuid.ToString());
            }

            if (employee == null)
            {
                employee = await _userManager.Users.FirstOrDefaultAsync(u => u.EmployeeId == request.CreateAssignmentDto.EmployeeId, cancellationToken);
            }

            if (employee == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), request.CreateAssignmentDto.EmployeeId);
            }

            // Check if the employee has the correct role (Cameraman or Expert)
            var roles = await _userManager.GetRolesAsync(employee);
            if (!roles.Contains("Cameraman") && !roles.Contains("Expert"))
            {
                throw new BadRequestException("Only employees with 'Cameraman' or 'Expert' roles can be assigned to events.");
            }

            // Check if already assigned with this role
            if (await _assignmentRepository.IsEmployeeAssignedWithRoleAsync(
                employee.Id, 
                request.CreateAssignmentDto.EventId, 
                request.CreateAssignmentDto.Role))
            {
                throw new BadRequestException($"Employee is already assigned to this event as a {request.CreateAssignmentDto.Role}.");
            }

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                EventId = request.CreateAssignmentDto.EventId,
                EmployeeId = employee.Id,
                Role = request.CreateAssignmentDto.Role,
                AssignedBy = _userContext.GetUserId(),
                Status = AssignmentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _assignmentRepository.AddAsync(assignment);

            // Fetch with navigation properties
            var createdAssignment = await _assignmentRepository.GetByIdAsync(assignment.Id);
            return _mapper.Map<AssignmentDto>(createdAssignment);
        }
    }
}
