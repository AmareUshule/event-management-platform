using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All actions in this controller require authorization
    public class MediaController : ControllerBase
    {
        // TODO: Implement media related endpoints
    }
}
