using EEP.EventManagement.Api.Application.Features.Media.Commands;
using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using EEP.EventManagement.Api.Application.Features.Media.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MediaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MediaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Admin,Expert,Cameraman")]
        public async Task<ActionResult<MediaFileDto>> UploadMedia([FromForm] UploadMediaDto uploadMediaDto)
        {
            var command = new UploadMediaCommand { UploadMediaDto = uploadMediaDto };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<List<MediaFileDto>>> GetMediaByEvent(Guid eventId)
        {
            var query = new GetMediaByEventQuery { EventId = eventId };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
