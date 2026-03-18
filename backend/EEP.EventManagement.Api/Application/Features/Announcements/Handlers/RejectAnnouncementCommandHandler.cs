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
    public class RejectAnnouncementCommandHandler : IRequestHandler<RejectAnnouncementCommand, AnnouncementDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public RejectAnnouncementCommandHandler(IAnnouncementRepository announcementRepository, IMapper mapper, IUserContext userContext)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AnnouncementDto> Handle(RejectAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var announcement = await _announcementRepository.GetByIdAsync(request.Id);
            if (announcement == null)
                throw new NotFoundException($"Announcement with ID {request.Id} not found.");

            var isCommManager = _userContext.IsInRole("Admin") || _userContext.HasClaim("Permission", "IsCommunicationManager");
            if (!isCommManager)
                throw new UnauthorizedException("Only Communication Manager can reject announcements.");

            if (announcement.Status != AnnouncementStatus.PendingApproval)
                throw new BadRequestException("Only PendingApproval announcements can be rejected.");

            announcement.Status = AnnouncementStatus.Rejected;
            announcement.ApprovedBy = null;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _announcementRepository.UpdateAsync(announcement);

            var updated = await _announcementRepository.GetByIdAsync(announcement.Id);
            return _mapper.Map<AnnouncementDto>(updated);
        }
    }
}

