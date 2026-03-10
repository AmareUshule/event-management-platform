using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Features.Approval.Commands;
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
        private readonly Infrastructure.Security.IUserContext _userContext;

        public EventsController(
            IMediator mediator,
            AutoMapper.IMapper mapper,
            IAuthorizationService authorizationService,
            Infrastructure.Security.IUserContext userContext)
        {
            _mediator = mediator;
            _mapper = mapper;
            _authorizationService = authorizationService;
            _userContext = userContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<EventDto>>> GetAllEvents()
        {
            // Enforce per-role visibility rules:
            // - Admin, Communication Manager: all events
            // - Department Manager: events for their department
            // - Expert/Cameraman: events assigned to them
            // - Employee: approved events only

            var roles = _userContext.GetRoles();
            var currentUserId = _userContext.GetUserId();
            var departmentId = _userContext.GetDepartmentId();

            // Admin can see all events
            if (roles.Contains("Admin"))
            {
                var all = await _mediator.Send(new GetAllEventsQuery());
                return Ok(all);
            }

            // Communication Manager (Manager in Communication dept) can also see all
            var isCommManager = (await _authorizationService.AuthorizeAsync(
                User,
                null,
                Infrastructure.Security.Authorization.AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            if (isCommManager)
            {
                var all = await _mediator.Send(new GetAllEventsQuery());
                return Ok(all);
            }

            // Department Manager (non-Communication) can see only their department's events
            if (roles.Contains("Manager") && departmentId.HasValue)
            {
                var deptEvents = await _mediator.Send(new GetDepartmentEventsQuery
                {
                    DepartmentId = departmentId.Value
                });
                return Ok(deptEvents);
            }

            // Operational staff: Experts and Cameramen see events assigned to them
            if (roles.Contains("Expert") || roles.Contains("Cameraman"))
            {
                var assignedEvents = await _mediator.Send(new GetAssignedEventsQuery
                {
                    EmployeeId = currentUserId
                });
                return Ok(assignedEvents);
            }

            // Employees and any other authenticated users: only approved events
            var approved = await _mediator.Send(new GetApprovedEventsQuery());
            return Ok(approved);
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

        [HttpPost("{id}/approve")]
        [Authorize(Policy = EEP.EventManagement.Api.Infrastructure.Security.Authorization.AuthorizationPolicies.CanApproveAndAssign)]
        public async Task<ActionResult<EventDto>> ApproveEvent(Guid id)
        {
            var command = new ApproveEventCommand { EventId = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}