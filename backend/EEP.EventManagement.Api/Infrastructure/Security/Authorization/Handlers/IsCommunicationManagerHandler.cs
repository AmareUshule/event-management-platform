using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using System.Linq;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements;

namespace EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers
{
    public class IsCommunicationManagerHandler : AuthorizationHandler<IsCommunicationManagerRequirement>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IDepartmentRepository _departmentRepository;

        public IsCommunicationManagerHandler(UserManager<ApplicationUser> userManager, IDepartmentRepository departmentRepository)
        {
            _userManager = userManager;
            _departmentRepository = departmentRepository;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsCommunicationManagerRequirement requirement)
        {
            if (!context.User.Identity.IsAuthenticated)
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

            if (user.DepartmentId is Guid departmentId)
            {
                var department = await _departmentRepository.GetByIdAsync(departmentId);
                if (department != null && department.Name == "Communication")
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Fail();
        }
    }
}
