using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Media.Commands;
using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using EEP.EventManagement.Api.Application.Services;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using EEP.EventManagement.Api.Infrastructure.Storage.Interfaces;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace EEP.EventManagement.Api.Application.Features.Media.Handlers
{
    public class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, MediaFileDto>
    {
        private readonly IMediaFileRepository _mediaRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly ApplicationDbContext _context;
        private readonly IStorageService _storageService;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;
        private readonly INotificationService _notificationService;

        public UploadMediaCommandHandler(
            IMediaFileRepository mediaRepository,
            IEventRepository eventRepository,
            IAssignmentRepository assignmentRepository,
            ApplicationDbContext context,
            IStorageService storageService,
            IMapper mapper,
            IUserContext userContext,
            INotificationService notificationService)
        {
            _mediaRepository = mediaRepository;
            _eventRepository = eventRepository;
            _assignmentRepository = assignmentRepository;
            _context = context;
            _storageService = storageService;
            _mapper = mapper;
            _userContext = userContext;
            _notificationService = notificationService;
        }

        public async Task<MediaFileDto> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.UploadMediaDto.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.UploadMediaDto.EventId);
            }

            if (ev.Status != EventStatus.Scheduled && ev.Status != EventStatus.Ongoing && ev.Status != EventStatus.Completed && ev.Status != EventStatus.Covered)
            {
                throw new BadRequestException("Media can only be uploaded for scheduled, ongoing, completed, or covered events.");
            }

            var currentUserId = _userContext.GetUserId();
            var roles = _userContext.GetRoles().ToList();
            var isAdmin = roles.Contains("Admin");
            
            var userAssignments = await _assignmentRepository.GetAssignmentsByEmployeeIdAndEventIdAsync(currentUserId, ev.Id);
            var isAssigned = userAssignments.Any(a => 
                a.Status == AssignmentStatus.Accepted || 
                a.Status == AssignmentStatus.Submitted || 
                a.Status == AssignmentStatus.Covered ||
                a.Status == AssignmentStatus.VerifiedByCreator ||
                a.Status == AssignmentStatus.RevisionRequested);

            if (!isAdmin && !isAssigned)
            {
                var rolesStr = string.Join(", ", roles);
                throw new UnauthorizedException($"User {currentUserId} with roles [{rolesStr}] is not authorized to upload media for this event. No valid assignment found (Accepted, Submitted, Covered, Verified, or RevisionRequested).");
            }

            var mediaFile = new MediaFile
            {
                EventId = ev.Id,
                FileType = request.UploadMediaDto.FileType,
                UploadedBy = currentUserId,
                MediaSubCategoryId = request.UploadMediaDto.MediaSubCategoryId
            };

            if (request.UploadMediaDto.FileType == MediaType.Link)
            {
                mediaFile.FilePath = request.UploadMediaDto.ExternalUrl;
                mediaFile.FileName = "External Link";
                mediaFile.FileSize = 0;
            }
            else
            {
                if (request.UploadMediaDto.File == null)
                {
                    throw new BadRequestException("File is required for non-link media types.");
                }

                using (var stream = request.UploadMediaDto.File.OpenReadStream())
                {
                    // Build storage path. If sub-category provided, try to use category/subcategory names.
                    string storagePath = $"uploads/events/{ev.Id}";
                    if (mediaFile.MediaSubCategoryId.HasValue)
                    {
                        var sub = await _context.MediaSubCategories
                            .Include(sc => sc.MediaCategory)
                            .FirstOrDefaultAsync(sc => sc.Id == mediaFile.MediaSubCategoryId.Value, cancellationToken: cancellationToken);
                        if (sub != null)
                        {
                            string sanitize(string s) => string.IsNullOrWhiteSpace(s) ? "unknown" : string.Concat(s.Split(Path.GetInvalidFileNameChars())).Replace(' ', '_');
                            var categoryName = sanitize(sub.MediaCategory?.Name ?? "Uncategorized");
                            var subName = sanitize(sub.Name);
                            storagePath = Path.Combine("uploads", categoryName, subName);
                        }
                    }

                    var filePath = await _storageService.SaveFileAsync(stream, request.UploadMediaDto.File.FileName, storagePath);
                    mediaFile.FileName = request.UploadMediaDto.File.FileName;
                    mediaFile.FilePath = filePath;
                    mediaFile.FileSize = request.UploadMediaDto.File.Length;

                    // Generate thumbnail for images
                    if (request.UploadMediaDto.FileType == MediaType.Image)
                    {
                        // TODO: Implement thumbnail generation
                        // mediaFile.ThumbnailPath = await _storageService.GenerateThumbnailAsync(stream, request.UploadMediaDto.File.FileName, $"uploads/events/{ev.Id}/thumbnails");
                    }
                }
            }

            var result = await _mediaRepository.AddAsync(mediaFile);

            // Notify event creator
            if (ev.CreatedBy != Guid.Empty)
            {
                await _notificationService.SendNotificationAsync(
                    ev.CreatedBy,
                    "New Media Uploaded",
                    $"New media has been uploaded for the event: {ev.Title}",
                    NotificationType.Event,
                    ev.Id
                );
            }

            return _mapper.Map<MediaFileDto>(result);
        }
    }
}
