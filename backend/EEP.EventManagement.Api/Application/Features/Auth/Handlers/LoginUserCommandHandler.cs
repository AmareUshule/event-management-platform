using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.Commands;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using EEP.EventManagement.Api.Infrastructure.Security.JWT;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Application.Exceptions;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace EEP.EventManagement.Api.Application.Features.Auth.Handlers
{
    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, LoginResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly IDepartmentRepository _departmentRepository;

        public LoginUserCommandHandler(UserManager<ApplicationUser> userManager, JwtTokenGenerator jwtTokenGenerator, IDepartmentRepository departmentRepository)
        {
            _userManager = userManager;
            _jwtTokenGenerator = jwtTokenGenerator;
            _departmentRepository = departmentRepository;
        }

        public async Task<LoginResponseDto> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByNameAsync(request.LoginDto.EmployeeId);
            if (user == null)
            {
                throw new UnauthorizedException("Invalid credentials.");
            }

            var result = await _userManager.CheckPasswordAsync(user, request.LoginDto.Password);
            if (!result)
            {
                throw new UnauthorizedException("Invalid credentials.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<System.Security.Claims.Claim>();

            // Add IsCommunicationManager claim if user is a Manager in the Communication department
            if (roles.Contains("Manager") && user.DepartmentId.HasValue)
            {
                var department = await _departmentRepository.GetByIdAsync(user.DepartmentId.Value);
                if (department != null && department.Name == "Communication")
                {
                    claims.Add(new System.Security.Claims.Claim("Permission", "IsCommunicationManager"));
                }
            }

            var token = _jwtTokenGenerator.GenerateToken(user, roles, claims);

            return new LoginResponseDto
            {
                Token = token,
                LastName = user.LastName,
                FirstName = user.FirstName,
                UserId = user.Id.ToString(),
                Email = user.Email!,
                Role = roles.FirstOrDefault() ?? string.Empty,
                EmployeeId = user.EmployeeId,
                DepartmentId = user.DepartmentId
            };
        }
    }
}
