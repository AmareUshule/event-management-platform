using Microsoft.AspNetCore.Mvc;
using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.Commands;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Application.Features.Auth.Validators;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequestDto dto)
        {
            var validator = new RegisterUserValidator();
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            var command = new RegisterUserCommand(dto);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // Optional: POST /login endpoint
    }
}
