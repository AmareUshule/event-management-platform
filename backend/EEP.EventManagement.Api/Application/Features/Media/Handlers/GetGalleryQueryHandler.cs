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

            // Define the media types allowed in the gallery.
            var allowedMediaTypes = new[] { MediaType.Image, MediaType.Video };

            var query = _context.MediaFiles
                .Include(media => media.Event)
                .Include(media => media.MediaSubCategory)
                    .ThenInclude(sc => sc.MediaCategory)
                .Where(media => media.Event != null
                                && publicEventStatuses.Contains(media.Event.Status)
                                && allowedMediaTypes.Contains(media.FileType));

            if (request.MediaCategoryId.HasValue)
            {
                query = query.Where(media => media.MediaSubCategory != null && media.MediaSubCategory.MediaCategoryId == request.MediaCategoryId.Value);
            }

            if (request.MediaSubCategoryId.HasValue)
            {
                query = query.Where(media => media.MediaSubCategoryId == request.MediaSubCategoryId.Value);
            }

            var galleryMedia = await query
                .OrderByDescending(media => media.Event.StartDate)
                .Select(media => new GalleryMediaDto
                {
                    MediaId = media.Id,
                    FilePath = media.FilePath,
                    FileType = media.FileType,
                    EventId = media.Event.Id,
                    EventTitle = media.Event.Title,
                    EventDate = media.Event.StartDate,
                    CategoryName = media.MediaSubCategory != null && media.MediaSubCategory.MediaCategory != null ? media.MediaSubCategory.MediaCategory.Name : "Uncategorized",
                    SubCategoryName = media.MediaSubCategory != null ? media.MediaSubCategory.Name : string.Empty
                })
                .ToListAsync(cancellationToken);

            return galleryMedia;
        }
    }
}
