using EEP.EventManagement.Api.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System;

namespace EEP.EventManagement.Api.Application.Features.Media.DTOs
{
    public class UploadMediaDto
    {
        public Guid EventId { get; set; }
        public MediaType FileType { get; set; }
        public IFormFile? File { get; set; }
        public string? ExternalUrl { get; set; } // For 'Link' type
    }

    public class MediaFileDto
    {
        public Guid Id { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? ThumbnailPath { get; set; }
        public MediaType FileType { get; set; }
        public long FileSize { get; set; }
        public Guid EventId { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid UploadedBy { get; set; }
        public string? UploaderName { get; set; }
        public string? UploaderFirstName { get; set; }
        public string? UploaderLastName { get; set; }
    }
}
