using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Manager,Expert,Cameraman")] // All actions in this controller require authorization
    public class MediaController : ControllerBase
    {
        // TODO: Implement media related endpoints
    }
}
