using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Application.Features.Announcements.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Handlers
{
    public class GetAnnouncementsPagedQueryHandler : IRequestHandler<GetAnnouncementsPagedQuery, (List<AnnouncementDto> Items, int TotalCount)>
    {
        private readonly IAnnouncementRepository _announcementRepository;
        private readonly IMapper _mapper;

        public GetAnnouncementsPagedQueryHandler(IAnnouncementRepository announcementRepository, IMapper mapper)
        {
            _announcementRepository = announcementRepository;
            _mapper = mapper;
        }

        public async Task<(List<AnnouncementDto> Items, int TotalCount)> Handle(GetAnnouncementsPagedQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _announcementRepository.GetPagedAsync(request.Status, request.CreatedById, request.Page, request.PageSize);
            var dtos = _mapper.Map<List<AnnouncementDto>>(items);
            return (dtos, totalCount);
        }
    }
}
