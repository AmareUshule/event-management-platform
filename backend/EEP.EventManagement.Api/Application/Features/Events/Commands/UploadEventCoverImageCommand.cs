using MediatR;
using System;
using System.IO;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class UploadEventCoverImageCommand : IRequest<string>
    {
        public Guid EventId { get; set; }
        public Stream FileStream { get; set; } = null!;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
    }
}
