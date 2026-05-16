using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class MediaFile : BaseEntity
    {
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? ThumbnailPath { get; set; }
        public MediaType FileType { get; set; }
        public long FileSize { get; set; }
        public Guid EventId { get; set; }
        public Event? Event { get; set; }
        public Guid? UploadedBy { get; set; }
        public ApplicationUser? Uploader { get; set; }
    }
}
