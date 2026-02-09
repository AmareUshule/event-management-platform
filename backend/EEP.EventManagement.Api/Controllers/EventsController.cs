using EEP.EventManagement.Api.DTOs.Events;
using EEP.EventManagement.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EEP.EventManagement.Api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEventDto dto)
    {
        var result = await _eventService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var events = await _eventService.GetAllAsync();
        return Ok(events);
    }
}
