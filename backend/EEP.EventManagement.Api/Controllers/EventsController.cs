using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EEP.EventManagement.Api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EventsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEventCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var events = await _mediator.Send(new GetAllEventsQuery());
        return Ok(events);
    }
}
