using System.Linq;
using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, AnnouncementDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public CreateAnnouncementCommandHandler(IAnnouncementRepository announcementRepository, IMapper mapper, IUserContext userContext)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AnnouncementDto> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetUserId();
            var announcement = _mapper.Map<Announcement>(request.CreateAnnouncementDto);
            
            announcement.Status = AnnouncementStatus.Draft;
            announcement.CreatedBy = userId;
            announcement.CreatedAt = DateTime.UtcNow;
            announcement.UpdatedAt = DateTime.UtcNow;

            if (announcement.Deadline.HasValue)
            {
                announcement.Deadline = DateTime.SpecifyKind(announcement.Deadline.Value, DateTimeKind.Utc);
            }

            announcement = await _announcementRepository.AddAsync(announcement);

            if (request.CreateAnnouncementDto.JobVacancies != null && request.CreateAnnouncementDto.JobVacancies.Any())
            {
                foreach (var jobVacancyDto in request.CreateAnnouncementDto.JobVacancies)
                {
                    var jobVacancy = _mapper.Map<JobVacancy>(jobVacancyDto);
                    jobVacancy.AnnouncementId = announcement.Id;
                    announcement.JobVacancies.Add(jobVacancy);
                }
                await _announcementRepository.UpdateAsync(announcement); // To save the newly added job vacancies
            }

            // Reload to include navigation properties
            var result = await _announcementRepository.GetByIdAsync(announcement.Id, includeMediaAndJobs: true);
            return _mapper.Map<AnnouncementDto>(result);
        }
    }
}
