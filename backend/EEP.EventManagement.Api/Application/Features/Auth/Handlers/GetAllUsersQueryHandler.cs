using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.Queries;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Auth.Handlers
{
    public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, List<UserResponseDto>>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public GetAllUsersQueryHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<List<UserResponseDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            List<ApplicationUser> users;
            if (!string.IsNullOrEmpty(request.Role))
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(request.Role);
                users = usersInRole.ToList();
            }
            else
            {
                users = _userManager.Users.ToList();
            }
            
            var userResponseDtos = new List<UserResponseDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userResponseDtos.Add(new UserResponseDto
                {
                    Id = user.Id.ToString(),
                    LastName = user.LastName,
                    FirstName = user.FirstName,
                    Email = user.Email!,
                    Role = roles.FirstOrDefault() ?? string.Empty,
                    DepartmentId = user.DepartmentId,
                    EmployeeId = user.EmployeeId
                });
            }

            return userResponseDtos;
        }
    }
}
