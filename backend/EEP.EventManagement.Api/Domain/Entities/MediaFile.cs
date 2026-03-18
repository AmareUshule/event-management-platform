using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class MediaFile : BaseEntity
    {
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public MediaType FileType { get; set; }
        public Guid EventId { get; set; }
        public Event? Event { get; set; }
    }
}
