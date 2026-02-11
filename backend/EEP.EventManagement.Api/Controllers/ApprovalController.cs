using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All actions in this controller require authorization
    public class ApprovalController : ControllerBase
    {
        // TODO: Implement approval related endpoints
    }
}
