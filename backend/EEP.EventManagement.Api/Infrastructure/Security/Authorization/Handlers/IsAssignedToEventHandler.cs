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
    public class IsAssignedToEventHandler : AuthorizationHandler<IsAssignedToEventRequirement>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAssignmentRepository _assignmentRepository;

        public IsAssignedToEventHandler(UserManager<ApplicationUser> userManager, IAssignmentRepository assignmentRepository)
        {
            _userManager = userManager;
            _assignmentRepository = assignmentRepository;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsAssignedToEventRequirement requirement)
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
            if (!roles.Contains("Expert") && !roles.Contains("Cameraman"))
            {
                context.Fail();
                return;
            }

            // Check if the user is assigned to the event
            var assignments = await _assignmentRepository.GetAssignmentsByUserIdAndEventIdAsync(user.Id, requirement.EventId);
            if (assignments.Any())
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
