using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = AuthorizationPolicies.CanApproveAndAssign)] // All actions in this controller require authorization
    public class ApprovalController : ControllerBase
    {
        // TODO: Implement approval related endpoints
    }
}
