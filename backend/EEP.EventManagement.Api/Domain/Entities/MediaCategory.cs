using EEP.EventManagement.Api.Domain.Common;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class MediaCategory : BaseEntity
    {
        public string Name { get; set; } = string.Empty;

        public ICollection<MediaSubCategory> SubCategories { get; set; } = new List<MediaSubCategory>();
    }
}
