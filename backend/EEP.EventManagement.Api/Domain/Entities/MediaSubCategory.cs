using EEP.EventManagement.Api.Domain.Common;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class MediaSubCategory : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public Guid MediaCategoryId { get; set; }
        public MediaCategory? MediaCategory { get; set; }
    }
}
