using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.Commands;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using EEP.EventManagement.Api.Application.Exceptions;
using System;
using System.Linq;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;

namespace EEP.EventManagement.Api.Application.Features.Auth.Handlers
{
    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IDepartmentRepository _departmentRepository;

        public UpdateUserCommandHandler(UserManager<ApplicationUser> userManager, IDepartmentRepository departmentRepository)
        {
            _userManager = userManager;
            _departmentRepository = departmentRepository;
        }

        public async Task<UserResponseDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var dto = request.UserDto;

            var user = await _userManager.FindByIdAsync(dto.Id);
            if (user == null)
            {
                throw new NotFoundException($"User with ID {dto.Id} not found.");
            }

            // Validate DepartmentId if provided
            if (dto.DepartmentId.HasValue)
            {
                var department = await _departmentRepository.GetByIdAsync(dto.DepartmentId.Value);
                if (department == null)
                {
                    throw new BadRequestException($"Department with ID {dto.DepartmentId} not found.");
                }
            }

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;
            user.EmployeeId = dto.EmployeeId;
            user.UserName = dto.EmployeeId; // Keep UserName same as EmployeeId
            user.DepartmentId = dto.DepartmentId;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));
            }

            // Update roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles.ToArray());
            await _userManager.AddToRoleAsync(user, dto.Role);

            return new UserResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? string.Empty,
                Role = dto.Role,
                DepartmentId = user.DepartmentId
            };
        }
    }
}
