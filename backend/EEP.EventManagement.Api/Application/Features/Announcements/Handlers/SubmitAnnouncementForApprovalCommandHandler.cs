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
    public class SubmitAnnouncementForApprovalCommandHandler : IRequestHandler<SubmitAnnouncementForApprovalCommand, AnnouncementDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public SubmitAnnouncementForApprovalCommandHandler(IAnnouncementRepository announcementRepository, IMapper mapper, IUserContext userContext)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AnnouncementDto> Handle(SubmitAnnouncementForApprovalCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            var announcement = await _announcementRepository.GetByIdAsync(request.Id);

            if (announcement == null)
                throw new NotFoundException($"Announcement with ID {request.Id} not found.");

            var isAuthor = announcement.CreatedBy == userId;
            if (!isAuthor)
                throw new UnauthorizedException("Only the author can submit an announcement for approval.");

            if (announcement.Status != AnnouncementStatus.Draft && announcement.Status != AnnouncementStatus.Rejected)
                throw new BadRequestException("Only Draft/Rejected announcements can be submitted for approval.");

            announcement.Status = AnnouncementStatus.PendingApproval;
            announcement.UpdatedAt = DateTime.UtcNow;
            announcement.ApprovedBy = null;

            await _announcementRepository.UpdateAsync(announcement);

            var updated = await _announcementRepository.GetByIdAsync(announcement.Id);
            return _mapper.Map<AnnouncementDto>(updated);
        }
    }
}

