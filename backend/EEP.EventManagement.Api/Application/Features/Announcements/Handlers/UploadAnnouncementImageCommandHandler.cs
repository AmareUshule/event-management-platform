using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Storage.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class UploadAnnouncementImageCommandHandler : IRequestHandler<UploadAnnouncementImageCommand, AnnouncementImageDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IStorageService _storageService;
        private readonly IMapper _mapper;

        public UploadAnnouncementImageCommandHandler(IAnnouncementRepository announcementRepository, IStorageService storageService, IMapper mapper)
        {
            _announcementRepository = announcementRepository;
            _storageService = storageService;
            _mapper = mapper;
        }

        public async Task<AnnouncementImageDto> Handle(UploadAnnouncementImageCommand request, CancellationToken cancellationToken)
        {
            var announcement = await _announcementRepository.GetByIdAsync(request.AnnouncementId);

            if (announcement == null)
                throw new NotFoundException($"Announcement with ID {request.AnnouncementId} not found.");

            if (announcement.Status != AnnouncementStatus.Draft)
                throw new BadRequestException("Images can only be uploaded when status = Draft.");

            var folderPath = $"/uploads/announcements/{announcement.Id}/";
            var imageUrl = await _storageService.SaveFileAsync(request.FileStream, request.FileName, folderPath);

            var image = new AnnouncementImage
            {
                Id = Guid.NewGuid(),
                AnnouncementId = announcement.Id,
                ImageUrl = imageUrl,
                FileName = request.FileName,
                ContentType = request.ContentType,
                UploadedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _announcementRepository.AddImageAsync(image);

            return _mapper.Map<AnnouncementImageDto>(image);
        }
    }
}
