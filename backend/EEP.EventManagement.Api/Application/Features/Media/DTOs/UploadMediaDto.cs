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
        public MediaType FileType { get; set; }
        public Guid EventId { get; set; }
    }
}
