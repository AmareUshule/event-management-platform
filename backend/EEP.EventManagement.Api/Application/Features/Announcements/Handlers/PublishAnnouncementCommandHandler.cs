using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Application.Services;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class PublishAnnouncementCommandHandler : IRequestHandler<PublishAnnouncementCommand, AnnouncementDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;
        private readonly INotificationService _notificationService;

        public PublishAnnouncementCommandHandler(
            IAnnouncementRepository announcementRepository, 
            IMapper mapper, 
            IUserContext userContext,
            INotificationService notificationService)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
            _userContext = userContext;
            _notificationService = notificationService;
        }

        public async Task<AnnouncementDto> Handle(PublishAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            var announcement = await _announcementRepository.GetByIdAsync(request.Id, includeMediaAndJobs: true);

            if (announcement == null)
                throw new NotFoundException($"Announcement with ID {request.Id} not found.");

            if (announcement.Status == AnnouncementStatus.Published)
                throw new BadRequestException("Announcement is already published.");

            // Only allow publishing when it has been submitted (or when comm manager publishes directly).
            if (announcement.Status != AnnouncementStatus.PendingApproval && announcement.Status != AnnouncementStatus.Draft)
                throw new BadRequestException("Only Draft or PendingApproval announcements can be published.");

            announcement.Status = AnnouncementStatus.Published;
            announcement.ApprovedBy = userId;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _announcementRepository.UpdateAsync(announcement);

            // Trigger notification
            await _notificationService.SendToAllAsync(
                "New Announcement",
                $"A new announcement has been published: {announcement.Title}",
                NotificationType.Announcement,
                announcement.Id
            );

            if (announcement.JobVacancies != null && announcement.JobVacancies.Any())
            {
                foreach (var job in announcement.JobVacancies)
                {
                    await _notificationService.SendToAllAsync(
                        "New Job Vacancy",
                        $"A new job vacancy is available: {job.JobTitle} in {job.WorkUnit}",
                        NotificationType.Announcement, // Or separate JobVacancy type if it existed, but requirement says announcement/event/assignment/system
                        announcement.Id
                    );
                }
            }

            return _mapper.Map<AnnouncementDto>(announcement);
        }
    }
}
