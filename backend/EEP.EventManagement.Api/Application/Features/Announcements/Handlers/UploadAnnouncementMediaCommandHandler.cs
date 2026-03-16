using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Storage.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class UploadAnnouncementMediaCommandHandler : IRequestHandler<UploadAnnouncementMediaCommand, AnnouncementMediaDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IStorageService _storageService;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public UploadAnnouncementMediaCommandHandler(IAnnouncementRepository announcementRepository, IStorageService storageService, IMapper mapper, IUserContext userContext)
        {
            _announcementRepository = announcementRepository;
            _storageService = storageService;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AnnouncementMediaDto> Handle(UploadAnnouncementMediaCommand request, CancellationToken cancellationToken)
        {
            var announcement = await _announcementRepository.GetByIdAsync(request.AnnouncementId);

            if (announcement == null)
                throw new NotFoundException($"Announcement with ID {request.AnnouncementId} not found.");

            if (announcement.Status != AnnouncementStatus.Draft && announcement.Status != AnnouncementStatus.Rejected)
                throw new BadRequestException("Files can only be uploaded when status = Draft or Rejected.");

            var folderPath = $"/uploads/announcements/{announcement.Id}/";
            var fileUrl = await _storageService.SaveFileAsync(request.FileStream, request.FileName, folderPath);

            string fileType = "Unknown";
            if (request.ContentType.StartsWith("image/"))
            {
                fileType = "Image";
            }
            else if (request.ContentType == "application/pdf")
            {
                fileType = "Pdf";
            }

            var media = new AnnouncementMedia
            {
                Id = Guid.NewGuid(),
                AnnouncementId = announcement.Id,
                FileUrl = fileUrl,
                FileName = request.FileName,
                ContentType = request.ContentType,
                FileType = fileType,
                UploadedAt = DateTime.UtcNow,
                UploadedBy = _userContext.GetUserId(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _announcementRepository.AddMediaAsync(media);

            return _mapper.Map<AnnouncementMediaDto>(media);
        }
    }
}
