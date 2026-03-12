using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Media.Commands
{
    public class UploadMediaCommand : IRequest<MediaFileDto>
    {
        public UploadMediaDto UploadMediaDto { get; set; } = null!;
    }
}
