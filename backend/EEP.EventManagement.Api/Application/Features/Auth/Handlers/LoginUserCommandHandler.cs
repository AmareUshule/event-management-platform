using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.Commands;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using EEP.EventManagement.Api.Infrastructure.Security.JWT;
using EEP.EventManagement.Api.Application.Exceptions;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace EEP.EventManagement.Api.Application.Features.Auth.Handlers
{
    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, LoginResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtTokenGenerator _jwtTokenGenerator;

        public LoginUserCommandHandler(UserManager<ApplicationUser> userManager, JwtTokenGenerator jwtTokenGenerator)
        {
            _userManager = userManager;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<LoginResponseDto> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.EmployeeId == request.LoginDto.EmployeeId, cancellationToken);
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
            var token = _jwtTokenGenerator.GenerateToken(user, roles);

            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id.ToString(),
                Email = user.Email!,
                Role = roles.FirstOrDefault() ?? string.Empty,
                DepartmentId = user.DepartmentId
            };
        }
    }
}
