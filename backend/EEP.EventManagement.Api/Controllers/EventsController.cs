using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly AutoMapper.IMapper _mapper;
        private readonly IAuthorizationService _authorizationService;

        public EventsController(IMediator mediator, AutoMapper.IMapper mapper, IAuthorizationService authorizationService)
        {
            _mediator = mediator;
            _mapper = mapper;
            _authorizationService = authorizationService;
        }

        [HttpGet]
        public async Task<ActionResult<List<EventDto>>> GetAllEvents()
        {
            var query = new GetAllEventsQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEventById(Guid id)
        {
            var query = new GetEventByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "CanCreateEvent")]
        public async Task<ActionResult<EventDto>> CreateEvent([FromBody] CreateEventDto createEventDto)
        {
            var command = new CreateEventCommand { CreateEventDto = createEventDto };
            var result = await _mediator.Send(command);
            // Typically return 201 CreatedAtAction
            return CreatedAtAction(nameof(GetEventById), new { id = result.Id }, result);
        }

        [HttpPut]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateEvent([FromBody] UpdateEventDto updateEventDto)
        {
            var eventDto = await _mediator.Send(new GetEventByIdQuery { Id = updateEventDto.Id });

            if (!User.IsInRole("Admin"))
            {
                var authResult = await _authorizationService.AuthorizeAsync(User, null,
                    new IsDepartmentManagerOfResourceRequirement(eventDto.Department!.Id));

                if (!authResult.Succeeded)
                {
                    return Forbid();
                }
            }

            var command = new UpdateEventCommand { UpdateEventDto = updateEventDto };
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var eventDto = await _mediator.Send(new GetEventByIdQuery { Id = id });

            if (!User.IsInRole("Admin"))
            {
                var authResult = await _authorizationService.AuthorizeAsync(User, null,
                    new IsDepartmentManagerOfResourceRequirement(eventDto.Department!.Id));

                if (!authResult.Succeeded)
                {
                    return Forbid();
                }
            }

            var command = new DeleteEventCommand { Id = id };
            await _mediator.Send(command);
            return NoContent();
        }
    }
}