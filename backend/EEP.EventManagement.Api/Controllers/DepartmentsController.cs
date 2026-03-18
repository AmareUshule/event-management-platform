using MediatR;
using Microsoft.AspNetCore.Mvc;
using EEP.EventManagement.Api.Application.Features.Departments.Commands;
using EEP.EventManagement.Api.Application.Features.Departments.Queries;
using EEP.EventManagement.Api.Application.Features.Departments.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Manager")] // All actions in this controller require Admin or Manager roles
    public class DepartmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DepartmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<DepartmentResponseDto>> CreateDepartment([FromBody] CreateDepartmentDto departmentDto)
        {
            var command = new CreateDepartmentCommand(departmentDto);
            var response = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetDepartmentById), new { id = response.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DepartmentResponseDto>> UpdateDepartment(Guid id, [FromBody] UpdateDepartmentDto departmentDto)
        {
            if (id != departmentDto.Id)
            {
                return BadRequest("Department ID in URL and body do not match.");
            }
            var command = new UpdateDepartmentCommand(departmentDto);
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDepartment(Guid id)
        {
            var command = new DeleteDepartmentCommand(id);
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DepartmentResponseDto>> GetDepartmentById(Guid id)
        {
            var query = new GetDepartmentByIdQuery(id);
            var response = await _mediator.Send(query);
            return Ok(response);
        }

        [HttpGet]
        public async Task<ActionResult<List<DepartmentResponseDto>>> GetAllDepartments()
        {
            var query = new GetAllDepartmentsQuery();
            var response = await _mediator.Send(query);
            return Ok(response);
        }
    }
}
