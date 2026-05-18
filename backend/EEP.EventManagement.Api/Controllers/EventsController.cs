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
        public async Task<ActionResult<List<EventDto>>> GetAllEvents([FromQuery] EventStatus? status)
        {
            var roles = _userContext.GetRoles();
            var currentUserId = _userContext.GetUserId();
            var currentUserDeptId = _userContext.GetDepartmentId();
            var isCommManager = (await _authorizationService.AuthorizeAsync(
                User,
                null,
                Infrastructure.Security.Authorization.AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            var allEvents = await _mediator.Send(new GetAllEventsQuery { Status = status });

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

                // New logic for Draft events (Pending Approval)
                if (e.Status == EventStatus.Draft.ToString())
                {
                    // Department Managers can only see Draft events from their own department
                    if (roles.Contains("Manager") && currentUserDeptId != null && 
                        e.Department != null && e.Department.Id == currentUserDeptId)
                    {
                        return true;
                    }

                    // Original logic: Creators can see their own Draft events
                    if (e.CreatedBy != null && e.CreatedBy.Id == currentUserId)
                    {
                        return true;
                    }

                    return false;
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

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateEventDto updateEventDto)
        {
            if (id != updateEventDto.Id)
            {
                return BadRequest(new { message = "ID in route does not match ID in body." });
            }

            var eventDto = await _mediator.Send(new GetEventByIdQuery { Id = updateEventDto.Id });

            if (eventDto == null)
            {
                return NotFound();
            }

            // Admin can edit any event in any status
            if (User.IsInRole("Admin"))
            {
                var command = new UpdateEventCommand { UpdateEventDto = updateEventDto };
                await _mediator.Send(command);
                return NoContent();
            }

            // For non-admins, editing is ONLY allowed if the event is in Draft status
            if (eventDto.Status != EventStatus.Draft.ToString())
            {
                return BadRequest(new { message = "Only events in Draft status can be edited." });
            }

            // Check if Communication Manager (can edit any Draft)
            var isCommManager = (await _authorizationService.AuthorizeAsync(
                User,
                null,
                Infrastructure.Security.Authorization.AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            // Check if Department Manager
            var isDeptManager = (await _authorizationService.AuthorizeAsync(User, null,
                new IsDepartmentManagerOfResourceRequirement(eventDto.Department!.Id))).Succeeded;

            // Check if Creator
            var isCreator = eventDto.CreatedBy != null && eventDto.CreatedBy.Id == _userContext.GetUserId();

            if (isCommManager || isDeptManager || isCreator)
            {
                // Ensure non-admins cannot change the status via this endpoint
                // They should use the Approval endpoint for status changes
                updateEventDto.Status = EventStatus.Draft;

                var command = new UpdateEventCommand { UpdateEventDto = updateEventDto };
                await _mediator.Send(command);
                return NoContent();
            }

            return Forbid();
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

        [HttpPost("{id}/cover-image")]
        public async Task<ActionResult<string>> UploadCoverImage(Guid id)
        {
            var eventDto = await _mediator.Send(new GetEventByIdQuery { Id = id });
            if (eventDto == null)
            {
                return NotFound();
            }

            if (!Request.HasFormContentType || Request.Form.Files.Count == 0)
            {
                return BadRequest(new { message = "A cover image file is required." });
            }

            var file = Request.Form.Files[0];
            if (file.Length == 0)
            {
                return BadRequest(new { message = "Uploaded file is empty." });
            }

            using var stream = file.OpenReadStream();
            var command = new UploadEventCoverImageCommand
            {
                EventId = id,
                FileStream = stream,
                FileName = file.FileName,
                ContentType = file.ContentType
            };

            var filePath = await _mediator.Send(command);
            return Ok(new { url = filePath });
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
        public async Task<ActionResult<EventDto>> ArchiveEvent(Guid id, [FromBody] ClosureCommentRequest request)
        {
            var command = new ArchiveEventCommand { EventId = id, ClosureComment = request.Comment };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/cancel")]
        [Authorize(Policy = EEP.EventManagement.Api.Infrastructure.Security.Authorization.AuthorizationPolicies.CanApproveAndAssign)]
        public async Task<ActionResult<EventDto>> CancelEvent(Guid id, [FromBody] ClosureCommentRequest request)
        {
            var command = new CancelEventCommand { EventId = id, ClosureComment = request.Comment };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        public class ClosureCommentRequest
        {
            public string Comment { get; set; } = string.Empty;
        }
    }
}