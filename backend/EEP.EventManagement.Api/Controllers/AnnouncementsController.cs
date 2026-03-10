using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Application.Features.Announcements.Queries;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnnouncementsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuthorizationService _authorizationService;
        private readonly IUserContext _userContext;

        public AnnouncementsController(IMediator mediator, IAuthorizationService authorizationService, IUserContext userContext)
        {
            _mediator = mediator;
            _authorizationService = authorizationService;
            _userContext = userContext;
        }

        [HttpPost]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult<AnnouncementDto>> Create([FromBody] CreateAnnouncementDto createDto)
        {
            var command = new CreateAnnouncementCommand { CreateAnnouncementDto = createDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet("published")]
        public async Task<ActionResult<object>> GetPublished([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = new GetAnnouncementsPagedQuery 
            { 
                Status = AnnouncementStatus.Published,
                Page = page,
                PageSize = pageSize
            };
            var (items, totalCount) = await _mediator.Send(query);
            return Ok(new { items, totalCount, page, pageSize });
        }

        [HttpGet("drafts")]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult<object>> GetDrafts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = new GetAnnouncementsPagedQuery 
            { 
                Status = AnnouncementStatus.Draft,
                Page = page,
                PageSize = pageSize
            };
            var (items, totalCount) = await _mediator.Send(query);
            return Ok(new { items, totalCount, page, pageSize });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AnnouncementDto>> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetAnnouncementByIdQuery { Id = id });
            if (result == null)
                return NotFound();

            // Additional visibility check if it's a draft
            if (result.Status == AnnouncementStatus.Draft.ToString())
            {
                var currentUserId = _userContext.GetUserId();
                var isAuthor = result.CreatedBy?.Id == currentUserId;
                var isCommManager = (await _authorizationService.AuthorizeAsync(User, AuthorizationPolicies.IsCommunicationManager)).Succeeded;
                
                if (!isAuthor && !isCommManager)
                    return Forbid();
            }

            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult<AnnouncementDto>> Update(Guid id, [FromBody] UpdateAnnouncementDto updateDto)
        {
            // Check if it's draft and user is author or Communication Manager
            var announcement = await _mediator.Send(new GetAnnouncementByIdQuery { Id = id });
            if (announcement == null)
                return NotFound();

            var currentUserId = _userContext.GetUserId();
            var isAuthor = announcement.CreatedBy?.Id == currentUserId;
            var isCommManager = (await _authorizationService.AuthorizeAsync(User, AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            if (!isAuthor && !isCommManager)
                return Forbid();

            var command = new UpdateAnnouncementCommand { Id = id, UpdateAnnouncementDto = updateDto };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult> Delete(Guid id)
        {
            var announcement = await _mediator.Send(new GetAnnouncementByIdQuery { Id = id });
            if (announcement == null)
                return NotFound();

            var currentUserId = _userContext.GetUserId();
            var isAuthor = announcement.CreatedBy?.Id == currentUserId;
            var isCommManager = (await _authorizationService.AuthorizeAsync(User, AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            if (!isAuthor && !isCommManager)
                return Forbid();

            await _mediator.Send(new DeleteAnnouncementCommand { Id = id });
            return NoContent();
        }

        [HttpPost("{id}/publish")]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult<AnnouncementDto>> Publish(Guid id)
        {
            var command = new PublishAnnouncementCommand { Id = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/images")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<AnnouncementImageDto>> UploadImage(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required.");

            // Validation: Only image files allowed (jpg, png, jpeg)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = System.IO.Path.GetExtension(file.FileName).ToLower();
            if (!System.Linq.Enumerable.Contains(allowedExtensions, extension))
                return BadRequest("Only image files (.jpg, .jpeg, .png) are allowed.");

            // Max file size limit (5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("File size exceeds 5MB limit.");

            // Check if it's draft and user is author or Communication Manager
            var announcement = await _mediator.Send(new GetAnnouncementByIdQuery { Id = id });
            if (announcement == null)
                return NotFound();

            if (announcement.Status != AnnouncementStatus.Draft.ToString())
                return BadRequest("Images can only be uploaded to draft announcements.");

            var currentUserId = _userContext.GetUserId();
            var isAuthor = announcement.CreatedBy?.Id == currentUserId;
            var isCommManager = (await _authorizationService.AuthorizeAsync(User, AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            if (!isAuthor && !isCommManager)
                return Forbid();

            using var stream = file.OpenReadStream();
            var command = new UploadAnnouncementImageCommand 
            { 
                AnnouncementId = id, 
                FileStream = stream, 
                FileName = file.FileName,
                ContentType = file.ContentType
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
