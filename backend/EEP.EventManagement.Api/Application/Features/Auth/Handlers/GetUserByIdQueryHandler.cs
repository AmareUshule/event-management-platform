using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.Queries;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using EEP.EventManagement.Api.Application.Exceptions;
using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.Handlers
{
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public GetUserByIdQueryHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserResponseDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.Id);
            if (user == null)
            {
                throw new NotFoundException($"User with ID {request.Id} not found.");
            }

            var roles = await _userManager.GetRolesAsync(user);

            return new UserResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email!,
                Role = roles.FirstOrDefault() ?? string.Empty,
                DepartmentId = user.DepartmentId
            };
        }
    }
}
