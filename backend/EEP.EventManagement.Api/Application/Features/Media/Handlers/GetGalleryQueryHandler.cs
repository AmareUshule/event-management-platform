using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using EEP.EventManagement.Api.Application.Features.Media.Queries;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Media.Handlers
{
    public class GetGalleryQueryHandler : IRequestHandler<GetGalleryQuery, List<GalleryMediaDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetGalleryQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<GalleryMediaDto>> Handle(GetGalleryQuery request, CancellationToken cancellationToken)
        {
            // Define the set of event statuses that are considered public for the gallery.
            var publicEventStatuses = new[]
            {
                EventStatus.Scheduled,
                EventStatus.Ongoing,
                EventStatus.Completed,
                EventStatus.Covered
            };

            var galleryMedia = await _context.MediaFiles
                .Include(media => media.Event) // Include the related Event data
                .Where(media => media.Event != null && publicEventStatuses.Contains(media.Event.Status))
                .OrderByDescending(media => media.Event.StartDate)
                .Select(media => new GalleryMediaDto
                {
                    MediaId = media.Id,
                    FilePath = media.FilePath,
                    FileType = media.FileType,
                    EventId = media.Event.Id,
                    EventTitle = media.Event.Title,
                    EventDate = media.Event.StartDate
                })
                .ToListAsync(cancellationToken);

            return galleryMedia;
        }
    }
}
