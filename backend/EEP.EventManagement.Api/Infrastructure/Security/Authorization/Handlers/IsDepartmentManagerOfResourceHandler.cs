using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using System.Linq;
using System;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements;

namespace EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers
{
    public class IsDepartmentManagerOfResourceHandler : AuthorizationHandler<IsDepartmentManagerOfResourceRequirement>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IDepartmentRepository _departmentRepository;

        public IsDepartmentManagerOfResourceHandler(UserManager<ApplicationUser> userManager, IDepartmentRepository departmentRepository)
        {
            _userManager = userManager;
            _departmentRepository = departmentRepository;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsDepartmentManagerOfResourceRequirement requirement)
        {
            if (context.User.Identity == null || !context.User.Identity.IsAuthenticated)
            {
                context.Fail();
                return;
            }

            var user = await _userManager.GetUserAsync(context.User);
            if (user == null)
            {
                context.Fail();
                return;
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains("Manager"))
            {
                context.Fail();
                return;
            }

            if (user.DepartmentId?.Equals(requirement.DepartmentId) == true)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
        }
    }
}
