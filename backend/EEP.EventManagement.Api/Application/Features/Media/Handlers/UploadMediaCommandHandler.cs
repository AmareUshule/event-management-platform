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

namespace EEP.EventManagement.Api.Application.Features.Media.Handlers
{
    public class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, MediaFileDto>
    {
        private readonly IMediaFileRepository _mediaRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IStorageService _storageService;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;
        private readonly INotificationService _notificationService;

        public UploadMediaCommandHandler(
            IMediaFileRepository mediaRepository,
            IEventRepository eventRepository,
            IStorageService storageService,
            IMapper mapper,
            IUserContext userContext,
            INotificationService notificationService)
        {
            _mediaRepository = mediaRepository;
            _eventRepository = eventRepository;
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

            if (ev.Status != EventStatus.Completed)
            {
                throw new BadRequestException("Media can only be uploaded for completed events.");
            }

            var currentUserId = _userContext.GetUserId();
            var roles = _userContext.GetRoles();
            var isAdmin = roles.Contains("Admin");
            var isAssigned = ev.Assignments.Any(a => a.EmployeeId == currentUserId && a.Status == AssignmentStatus.Accepted);

            if (!isAdmin && !isAssigned)
            {
                throw new UnauthorizedException("Only assigned staff who accepted the assignment can upload media.");
            }

            var mediaFile = new MediaFile
            {
                EventId = ev.Id,
                FileType = request.UploadMediaDto.FileType
            };

            if (request.UploadMediaDto.FileType == MediaType.Link)
            {
                mediaFile.FilePath = request.UploadMediaDto.ExternalUrl;
                mediaFile.FileName = "External Link";
            }
            else
            {
                if (request.UploadMediaDto.File == null)
                {
                    throw new BadRequestException("File is required for non-link media types.");
                }

                using (var stream = request.UploadMediaDto.File.OpenReadStream())
                {
                    var filePath = await _storageService.SaveFileAsync(stream, request.UploadMediaDto.File.FileName, $"uploads/events/{ev.Id}");
                    mediaFile.FileName = request.UploadMediaDto.File.FileName;
                    mediaFile.FilePath = filePath;
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
