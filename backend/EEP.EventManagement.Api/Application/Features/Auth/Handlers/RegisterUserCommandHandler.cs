using MediatR;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Application.Features.Auth.Commands;

namespace EEP.EventManagement.Api.Application.Features.Auth.Handlers
{
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, UserResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public RegisterUserCommandHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserResponseDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var dto = request.UserDto;

            var user = new ApplicationUser
            {
                UserName = dto.EmployeeId,
                EmployeeId = dto.EmployeeId,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                DepartmentId = dto.DepartmentId
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));
            }

            // Assign role
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
