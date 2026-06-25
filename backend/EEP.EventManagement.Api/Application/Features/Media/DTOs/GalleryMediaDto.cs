using EEP.EventManagement.Api.Domain.Enums;
using System;

namespace EEP.EventManagement.Api.Application.Features.Media.DTOs
{
    public class GalleryMediaDto
    {
        public Guid MediaId { get; set; }
        public string FilePath { get; set; }
        public MediaType FileType { get; set; }
        public Guid EventId { get; set; }
        public string EventTitle { get; set; }
        public DateTime EventDate { get; set; }
        public string CategoryName { get; set; }
        public string SubCategoryName { get; set; }
    }
}
