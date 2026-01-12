using Microsoft.AspNetCore.Mvc;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "API is running",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
