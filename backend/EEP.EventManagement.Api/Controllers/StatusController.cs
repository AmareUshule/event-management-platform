using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusController : ControllerBase
    {
        [HttpGet]
        [AllowAnonymous] // Allow anonymous access to the status endpoint
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
