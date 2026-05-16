using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Media.Commands;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using EEP.EventManagement.Api.Infrastructure.Storage.Interfaces;
using EEP.EventManagement.Api.Domain.Enums;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Media.Handlers
{
    public class DeleteMediaCommandHandler : IRequestHandler<DeleteMediaCommand, bool>
    {
        private readonly IMediaFileRepository _mediaRepository;
        private readonly IStorageService _storageService;
        private readonly IUserContext _userContext;

        public DeleteMediaCommandHandler(
            IMediaFileRepository mediaRepository,
            IStorageService storageService,
            IUserContext userContext)
        {
            _mediaRepository = mediaRepository;
            _storageService = storageService;
            _userContext = userContext;
        }

        public async Task<bool> Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
        {
            var media = await _mediaRepository.GetByIdAsync(request.MediaId);
            if (media == null)
            {
                throw new NotFoundException("Media", request.MediaId);
            }

            var currentUserId = _userContext.GetUserId();
            var isAdmin = _userContext.IsInRole("Admin");
            var isOwner = media.UploadedBy == currentUserId;

            if (!isAdmin && !isOwner)
            {
                throw new UnauthorizedException("You do not have permission to delete this media.");
            }

            // Delete from physical storage if it's not an external link
            if (media.FileType != MediaType.Link && !string.IsNullOrEmpty(media.FilePath))
            {
                await _storageService.DeleteFileAsync(media.FilePath);
                
                if (!string.IsNullOrEmpty(media.ThumbnailPath))
                {
                    await _storageService.DeleteFileAsync(media.ThumbnailPath);
                }
            }

            // Delete from database
            await _mediaRepository.DeleteAsync(media);

            return true;
        }
    }
}
