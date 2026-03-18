using EEP.EventManagement.Api.Application.Features.Assignments.Commands;
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using EEP.EventManagement.Api.Application.Features.Assignments.Queries;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/events/{eventId}/assignments")]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuthorizationService _authorizationService;
        private readonly IUserContext _userContext;

        public AssignmentsController(IMediator mediator, IAuthorizationService authorizationService, IUserContext userContext)
        {
            _mediator = mediator;
            _authorizationService = authorizationService;
            _userContext = userContext;
        }

        [HttpPost("bulk")]
        public async Task<ActionResult<List<AssignmentDto>>> BulkAssignStaff(Guid eventId, [FromBody] BulkAssignStaffDto bulkAssignStaffDto)
        {
            bulkAssignStaffDto.EventId = eventId;

            var isAdmin = User.IsInRole("Admin");
            var isCommunicationManagerAuth = await _authorizationService.AuthorizeAsync(User, null, AuthorizationPolicies.IsCommunicationManager);
            
            if (!isAdmin && !isCommunicationManagerAuth.Succeeded)
            {
                return Forbid();
            }

            var command = new BulkAssignStaffCommand { BulkAssignStaffDto = bulkAssignStaffDto };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<AssignmentDto>> AssignStaff(Guid eventId, [FromBody] CreateAssignmentDto createAssignmentDto)
        {
            createAssignmentDto.EventId = eventId;

            // Use imperative authorization to check for Admin OR Communication Manager
            var isAdmin = User.IsInRole("Admin");
            var isCommunicationManagerAuth = await _authorizationService.AuthorizeAsync(User, null, AuthorizationPolicies.IsCommunicationManager);
            
            if (!isAdmin && !isCommunicationManagerAuth.Succeeded)
            {
                return Forbid();
            }

            var command = new CreateAssignmentCommand { CreateAssignmentDto = createAssignmentDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAssignmentById), new { eventId = result.EventId, id = result.Id }, result);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Expert,Cameraman")]
        public async Task<IActionResult> UpdateAssignmentStatus(Guid eventId, Guid id, [FromBody] UpdateAssignmentStatusDto updateAssignmentStatusDto)
        {
            if (id != updateAssignmentStatusDto.Id)
            {
                return BadRequest("Assignment ID mismatch.");
            }

            var command = new UpdateAssignmentStatusCommand { UpdateAssignmentStatusDto = updateAssignmentStatusDto };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AssignmentDto>> GetAssignmentById(Guid eventId, Guid id)
        {
            var query = new GetAssignmentByIdQuery { Id = id };
            var result = await _mediator.Send(query);
            
            if (result.EventId != eventId)
            {
                return NotFound("Assignment does not belong to this event.");
            }

            // Authorization: Admin, Communication Manager, or the assigned employee
            var isAdmin = User.IsInRole("Admin");
            var isCommunicationManagerAuth = await _authorizationService.AuthorizeAsync(User, null, AuthorizationPolicies.IsCommunicationManager);
            var isAssignedEmployee = result.Employee != null && Guid.Parse(result.Employee.Id) == _userContext.GetUserId();

            if (!isAdmin && !isCommunicationManagerAuth.Succeeded && !isAssignedEmployee)
            {
                return Forbid();
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<List<AssignmentDto>>> GetAssignmentsByEvent(Guid eventId)
        {
            var query = new GetAssignmentsByEventQuery { EventId = eventId };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("/api/my-assignments")] // Absolute path to keep this independent of eventId
        [Authorize(Roles = "Expert,Cameraman")]
        public async Task<ActionResult<List<AssignmentDto>>> GetMyAssignments()
        {
            var userId = _userContext.GetUserId();
            var query = new GetAssignmentsByEmployeeQuery { EmployeeId = userId };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
