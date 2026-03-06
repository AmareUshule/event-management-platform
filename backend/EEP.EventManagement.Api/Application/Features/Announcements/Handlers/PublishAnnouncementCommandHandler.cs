using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class PublishAnnouncementCommandHandler : IRequestHandler<PublishAnnouncementCommand, AnnouncementDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public PublishAnnouncementCommandHandler(IAnnouncementRepository announcementRepository, IMapper mapper, IUserContext userContext)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AnnouncementDto> Handle(PublishAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            var announcement = await _announcementRepository.GetByIdAsync(request.Id);

            if (announcement == null)
                throw new NotFoundException($"Announcement with ID {request.Id} not found.");

            if (announcement.Status == AnnouncementStatus.Published)
                throw new BadRequestException("Announcement is already published.");

            announcement.Status = AnnouncementStatus.Published;
            announcement.ApprovedBy = userId;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _announcementRepository.UpdateAsync(announcement);

            return _mapper.Map<AnnouncementDto>(announcement);
        }
    }
}
