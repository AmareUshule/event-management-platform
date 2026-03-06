using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Commands
{
    public class CreateAnnouncementCommand : IRequest<AnnouncementDto>
    {
        public CreateAnnouncementDto CreateAnnouncementDto { get; set; } = null!;
    }

    public class UpdateAnnouncementCommand : IRequest<AnnouncementDto>
    {
        public Guid Id { get; set; }
        public UpdateAnnouncementDto UpdateAnnouncementDto { get; set; } = null!;
    }

    public class DeleteAnnouncementCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class PublishAnnouncementCommand : IRequest<AnnouncementDto>
    {
        public Guid Id { get; set; }
    }

    public class UploadAnnouncementImageCommand : IRequest<AnnouncementImageDto>
    {
        public Guid AnnouncementId { get; set; }
        public Stream FileStream { get; set; } = null!;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
    }
}
