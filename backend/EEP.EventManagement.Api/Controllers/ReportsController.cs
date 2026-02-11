using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Manager")] // All actions in this controller require authorization
    public class ReportsController : ControllerBase
    {
        // TODO: Implement report related endpoints
    }
}
