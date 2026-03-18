using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks; // Required for async operations

namespace EEP.EventManagement.Api.Application.Features.Auth.MappingResolvers
{
    public class UserRoleResolver : IValueResolver<ApplicationUser, UserResponseDto, string>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserRoleResolver(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public string Resolve(ApplicationUser source, UserResponseDto destination, string destMember, ResolutionContext context)
        {
            // This method cannot be async, so we need to block on the result.
            // In a real application, consider pre-loading roles or using a more
            // sophisticated mapping strategy if performance is critical.
            return _userManager.GetRolesAsync(source).Result.FirstOrDefault() ?? string.Empty;
        }
    }
}
