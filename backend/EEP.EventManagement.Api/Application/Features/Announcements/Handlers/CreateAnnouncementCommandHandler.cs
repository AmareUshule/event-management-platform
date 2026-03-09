using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Announcements.Commands;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
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

            announcement = await _announcementRepository.AddAsync(announcement);

            // Reload to include navigation properties if needed, but for create, we might just map it back
            var result = await _announcementRepository.GetByIdAsync(announcement.Id);
            return _mapper.Map<AnnouncementDto>(result);
        }
    }
}
