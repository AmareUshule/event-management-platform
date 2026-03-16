using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Application.Features.Announcements.Queries;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Authorization;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using System.Linq;
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
        [Authorize(Roles = "Admin,Manager")]
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
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<object>> GetDrafts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var currentUserId = _userContext.GetUserId();

            var query = new GetAnnouncementsPagedQuery 
            { 
                Status = AnnouncementStatus.Draft,
                CreatedById = currentUserId,
                Page = page,
                PageSize = pageSize
            };
            var (items, totalCount) = await _mediator.Send(query);
            return Ok(new { items, totalCount, page, pageSize });
        }

        [HttpGet("pending")]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult<object>> GetPending([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = new GetAnnouncementsPagedQuery
            {
                Status = AnnouncementStatus.PendingApproval,
                Page = page,
                PageSize = pageSize
            };
            var (items, totalCount) = await _mediator.Send(query);
            return Ok(new { items, totalCount, page, pageSize });
        }

        [HttpGet("rejected")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<object>> GetRejected([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var currentUserId = _userContext.GetUserId();

            var query = new GetAnnouncementsPagedQuery
            {
                Status = AnnouncementStatus.Rejected,
                CreatedById = currentUserId,
                Page = page,
                PageSize = pageSize
            };
            var (items, totalCount) = await _mediator.Send(query);
            return Ok(new { items, totalCount, page, pageSize });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AnnouncementDto>> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetAnnouncementByIdQuery { Id = id, IncludeDetails = true });
            if (result == null)
                return NotFound();

            // Visibility: only Published is public to authenticated users.
            // Any non-published (Draft/Pending/Rejected) is visible to Author or Communication Manager.
            if (result.Status != AnnouncementStatus.Published.ToString())
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
        [Authorize(Roles = "Admin,Manager")]
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
        [Authorize(Roles = "Admin,Manager")]
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

        [HttpPost("{id}/submit")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<AnnouncementDto>> SubmitForApproval(Guid id)
        {
            var command = new SubmitAnnouncementForApprovalCommand { Id = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/publish")]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult<AnnouncementDto>> Publish(Guid id)
        {
            var command = new PublishAnnouncementCommand { Id = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/reject")]
        [Authorize(Policy = AuthorizationPolicies.IsCommunicationManager)]
        public async Task<ActionResult<AnnouncementDto>> Reject(Guid id)
        {
            var command = new RejectAnnouncementCommand { Id = id };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/media")] // Changed from /images
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<AnnouncementMediaDto>> UploadMedia(Guid id, IFormFile file) // Changed method name and DTO
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required.");

            // Validation: Image files and PDF documents allowed
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".pdf" }; // Added .webp
            var extension = System.IO.Path.GetExtension(file.FileName)?.ToLowerInvariant(); // Use ToLowerInvariant for consistency
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension)) // Use .Contains extension method
                return BadRequest("Only images (.jpg, .jpeg, .png, .webp) and PDF files (.pdf) are allowed.");

            // Max file size limit (10MB for documents)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest("File size exceeds 10MB limit.");

            // Check if it's draft and user is author or Communication Manager
            var announcement = await _mediator.Send(new GetAnnouncementByIdQuery { Id = id });
            if (announcement == null)
                return NotFound();

            if (announcement.Status != AnnouncementStatus.Draft.ToString() && announcement.Status != AnnouncementStatus.Rejected.ToString())
                return BadRequest("Files can only be uploaded to Draft/Rejected announcements.");

            var currentUserId = _userContext.GetUserId();
            var isAuthor = announcement.CreatedBy?.Id == currentUserId;
            var isCommManager = (await _authorizationService.AuthorizeAsync(User, AuthorizationPolicies.IsCommunicationManager)).Succeeded;

            if (!isAuthor && !isCommManager)
                return Forbid();

            using var stream = file.OpenReadStream();
            var command = new UploadAnnouncementMediaCommand // Changed command type
            { 
                AnnouncementId = id, 
                FileStream = stream, 
                FileName = file.FileName,
                ContentType = file.ContentType
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("{id}/jobs")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<JobVacancyDto>> CreateJobVacancy(Guid id, [FromBody] CreateJobVacancyDto createJobVacancyDto)
        {
            var command = new CreateJobVacancyCommand { AnnouncementId = id, CreateJobVacancyDto = createJobVacancyDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetJobVacancies), new { id = id }, result);
        }

        [HttpGet("{id}/jobs")]
        public async Task<ActionResult<List<JobVacancyDto>>> GetJobVacancies(Guid id)
        {
            var query = new GetJobVacanciesQuery { AnnouncementId = id };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}