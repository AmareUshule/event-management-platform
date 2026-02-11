using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = AuthorizationPolicies.CanAssignStaff)] // All actions in this controller require authorization
    public class AssignmentsController : ControllerBase
    {
        // TODO: Implement assignment related endpoints
    }
}
