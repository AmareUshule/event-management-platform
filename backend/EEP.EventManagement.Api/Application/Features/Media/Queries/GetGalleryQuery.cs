using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using MediatR;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Media.Queries
{
    public class GetGalleryQuery : IRequest<List<GalleryMediaDto>>
    {
        public Guid? MediaCategoryId { get; set; }
        public Guid? MediaSubCategoryId { get; set; }
    }
}
