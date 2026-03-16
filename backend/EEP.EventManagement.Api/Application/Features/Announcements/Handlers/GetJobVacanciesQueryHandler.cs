using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Application.Features.Announcements.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class GetJobVacanciesQueryHandler : IRequestHandler<GetJobVacanciesQuery, List<JobVacancyDto>>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;

        public GetJobVacanciesQueryHandler(IAnnouncementRepository announcementRepository, IMapper mapper)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
        }

        public async Task<List<JobVacancyDto>> Handle(GetJobVacanciesQuery request, CancellationToken cancellationToken)
        {
            var announcement = await _announcementRepository.GetByIdAsync(request.AnnouncementId, includeMediaAndJobs: true);

            if (announcement == null)
            {
                throw new NotFoundException($"Announcement with ID {request.AnnouncementId} not found.");
            }

            return _mapper.Map<List<JobVacancyDto>>(announcement.JobVacancies);
        }
    }
}
