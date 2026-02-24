using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
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
    public class EventsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly AutoMapper.IMapper _mapper;

        public EventsController(IMediator mediator, AutoMapper.IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
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
        [Authorize]
        public async Task<ActionResult<EventDto>> CreateEvent([FromBody] CreateEventDto createEventDto)
        {
            var command = new CreateEventCommand { CreateEventDto = createEventDto };
            var result = await _mediator.Send(command);
            // Typically return 201 CreatedAtAction
            return CreatedAtAction(nameof(GetEventById), new { id = result.Id }, result);
        }

        [HttpPut]
        public async Task<IActionResult>
         UpdateEvent([FromBody] UpdateEventDto updateEventDto)
        {
            var command = new UpdateEventCommand { UpdateEventDto = updateEventDto };
            await _mediator.Send(command);
            return NoContent(); // Or return Ok(result) if UpdateEventCommand returns DTO
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult>
         DeleteEvent(Guid id)
        {
            var command = new DeleteEventCommand { Id = id };
            await _mediator.Send(command);
            return NoContent();
        }
    }
}