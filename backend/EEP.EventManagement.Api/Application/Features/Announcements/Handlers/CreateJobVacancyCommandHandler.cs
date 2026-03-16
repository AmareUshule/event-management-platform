using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class CreateJobVacancyCommandHandler : IRequestHandler<CreateJobVacancyCommand, JobVacancyDto>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;

        public CreateJobVacancyCommandHandler(IAnnouncementRepository announcementRepository, IMapper mapper)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
        }

        public async Task<JobVacancyDto> Handle(CreateJobVacancyCommand request, CancellationToken cancellationToken)
        {
            var announcement = await _announcementRepository.GetByIdAsync(request.AnnouncementId);

            if (announcement == null)
            {
                throw new NotFoundException($"Announcement with ID {request.AnnouncementId} not found.");
            }

            var jobVacancy = _mapper.Map<JobVacancy>(request.CreateJobVacancyDto);
            jobVacancy.AnnouncementId = request.AnnouncementId;
            jobVacancy.CreatedAt = DateTime.UtcNow;
            jobVacancy.UpdatedAt = DateTime.UtcNow;

            announcement.JobVacancies.Add(jobVacancy);
            await _announcementRepository.UpdateAsync(announcement); // Save changes to the announcement and its new job vacancy

            return _mapper.Map<JobVacancyDto>(jobVacancy);
        }
    }
}
