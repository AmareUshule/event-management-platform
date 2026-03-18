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
    public class BulkAssignStaffCommandHandler : IRequestHandler<BulkAssignStaffCommand, List<AssignmentDto>>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IEventRepository _eventRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public BulkAssignStaffCommandHandler(
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

        public async Task<List<AssignmentDto>> Handle(BulkAssignStaffCommand request, CancellationToken cancellationToken)
        {
            var eventId = request.BulkAssignStaffDto.EventId;
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
            {
                throw new NotFoundException(nameof(Event), eventId);
            }

            var currentUserId = _userContext.GetUserId();
            var assignments = new List<Assignment>();

            // Process Cameraman assignment
            if (!string.IsNullOrEmpty(request.BulkAssignStaffDto.CameramanId))
            {
                await ProcessAssignment(eventId, request.BulkAssignStaffDto.CameramanId, AssignmentRole.Cameraman, "Cameraman", assignments, currentUserId, cancellationToken);
            }

            // Process Expert assignment
            if (!string.IsNullOrEmpty(request.BulkAssignStaffDto.ExpertId))
            {
                await ProcessAssignment(eventId, request.BulkAssignStaffDto.ExpertId, AssignmentRole.Expert, "Expert", assignments, currentUserId, cancellationToken);
            }

            if (!assignments.Any())
            {
                throw new BadRequestException("At least one employee must be selected.");
            }

            foreach (var assignment in assignments)
            {
                await _assignmentRepository.AddAsync(assignment);
            }

            var results = new List<AssignmentDto>();
            foreach (var assignment in assignments)
            {
                var fullAssignment = await _assignmentRepository.GetByIdAsync(assignment.Id);
                results.Add(_mapper.Map<AssignmentDto>(fullAssignment));
            }

            return results;
        }

        private async Task ProcessAssignment(Guid eventId, string employeeIdStr, AssignmentRole role, string roleName, List<Assignment> assignments, Guid assignedBy, CancellationToken cancellationToken)
        {
            ApplicationUser? employee = null;
            if (Guid.TryParse(employeeIdStr, out var employeeGuid))
            {
                employee = await _userManager.FindByIdAsync(employeeGuid.ToString());
            }

            if (employee == null)
            {
                employee = await _userManager.Users.FirstOrDefaultAsync(u => u.EmployeeId == employeeIdStr, cancellationToken);
            }

            if (employee == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), employeeIdStr);
            }

            var roles = await _userManager.GetRolesAsync(employee);
            if (!roles.Contains(roleName))
            {
                throw new BadRequestException($"User {employee.UserName} is not a {roleName}.");
            }

            // Check if already assigned with this role
            if (await _assignmentRepository.IsEmployeeAssignedWithRoleAsync(employee.Id, eventId, role))
            {
                return; // Silently skip if already assigned
            }

            assignments.Add(new Assignment
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                EmployeeId = employee.Id,
                AssignedBy = assignedBy,
                Role = role,
                Status = AssignmentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}
