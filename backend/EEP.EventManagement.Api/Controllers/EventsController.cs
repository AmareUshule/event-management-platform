using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Features.Approval.Commands;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
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
        private readonly IUserContext _userContext;

        public EventsController(
            IMediator mediator,
            AutoMapper.IMapper mapper,
            IAuthorizationService authorizationService,
            IUserContext userContext)
        {
            _mediator = mediator;
            _mapper = mapper;
            _authorizationService = authorizationService;
            _userContext = userContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<EventDto>>> GetAllEvents()
        {
            var roles = _userContext.GetRoles();
            var currentUserId = _userContext.GetUserId();
            var isCommManager = (await _authorizationService.AuthorizeAsync(
                User,
                null,
                Infrastructure.Security.Authorization.AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            var allEvents = await _mediator.Send(new GetAllEventsQuery());

            // Admin and Communication Manager can see everything
            if (roles.Contains("Admin") || isCommManager)
            {
                return Ok(allEvents);
            }

            // Filter for other roles
            var visibleEvents = allEvents.Where(e =>
            {
                // Anyone can see Scheduled, Ongoing, Completed, Archived
                if (e.Status == EventStatus.Scheduled.ToString() || e.Status == EventStatus.Ongoing.ToString() || 
                    e.Status == EventStatus.Completed.ToString() || e.Status == EventStatus.Archived.ToString())
                {
                    return true;
                }

                // Creators can see their own Draft/Submitted events
                if (e.CreatedBy != null && e.CreatedBy.Id == currentUserId)
                {
                    return true;
                }

                // Assigned staff can see events they are assigned to (even if not yet Scheduled)
                if (e.Assignments != null && 
                    (e.Assignments.Cameraman.Any(a => a.EmployeeId == currentUserId) || 
                     e.Assignments.Expert.Any(a => a.EmployeeId == currentUserId)))
                {
                    return true;
                }

                return false;
            }).ToList();

            return Ok(visibleEvents);
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<List<EventDto>>> GetUpcomingEvents()
        {
            var query = new GetUpcomingEventsQuery();
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
            var eventEntity = await _mediator.Send(new GetEventByIdQuery { Id = updateEventDto.Id });

            if (eventEntity == null)
            {
                return NotFound();
            }

            if (!User.IsInRole("Admin")) // Regular update: check if they are the department manager
            {
                var authResult = await _authorizationService.AuthorizeAsync(User, null,
                    new IsDepartmentManagerOfResourceRequirement(eventEntity.Department!.Id));

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

        [HttpPost("{id}/submit")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<EventDto>> SubmitEvent(Guid id)
        {
            var command = new SubmitEventCommand { EventId = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/approve")]
        [Authorize(Policy = EEP.EventManagement.Api.Infrastructure.Security.Authorization.AuthorizationPolicies.CanApproveAndAssign)]
        public async Task<ActionResult<EventDto>> ApproveEvent(Guid id)
        {
            var command = new ApproveEventCommand { EventId = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/archive")]
        [Authorize(Policy = EEP.EventManagement.Api.Infrastructure.Security.Authorization.AuthorizationPolicies.CanApproveAndAssign)]
        public async Task<ActionResult<EventDto>> ArchiveEvent(Guid id)
        {
            var command = new ArchiveEventCommand { EventId = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}