using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class UpdateAnnouncementCommandHandler : IRequestHandler<UpdateAnnouncementCommand, AnnouncementDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public UpdateAnnouncementCommandHandler(IAnnouncementRepository announcementRepository, IMapper mapper, IUserContext userContext)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AnnouncementDto> Handle(UpdateAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            var announcement = await _announcementRepository.GetByIdAsync(request.Id);

            if (announcement == null)
                throw new NotFoundException($"Announcement with ID {request.Id} not found.");

            // Check if only author or Communication Manager can edit
            var isAuthor = announcement.CreatedBy == userId;
            var isCommManager = _userContext.IsInRole("Admin") || _userContext.HasClaim("Permission", "IsCommunicationManager");

            if (!isAuthor && !isCommManager)
                throw new UnauthorizedException("You do not have permission to edit this announcement.");

            if ((announcement.Status == AnnouncementStatus.Published) && !isCommManager)
                throw new BadRequestException("Published announcements cannot be edited by authors.");

            if (announcement.Status == AnnouncementStatus.PendingApproval && !isCommManager)
                throw new BadRequestException("Announcements pending approval cannot be edited until rejected.");

            if (announcement.Status == AnnouncementStatus.Published && isCommManager)
                throw new BadRequestException("Published announcements are immutable.");

            _mapper.Map(request.UpdateAnnouncementDto, announcement);
            announcement.UpdatedAt = DateTime.UtcNow;

            if (announcement.Deadline.HasValue)
            {
                announcement.Deadline = DateTime.SpecifyKind(announcement.Deadline.Value, DateTimeKind.Utc);
            }

            await _announcementRepository.UpdateAsync(announcement);

            // Re-fetch to get navigation properties
            var updatedAnnouncement = await _announcementRepository.GetByIdAsync(announcement.Id);

            return _mapper.Map<AnnouncementDto>(updatedAnnouncement);
        }
    }
}
