using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using MediatR;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Media.Queries
{
    public class GetGalleryQuery : IRequest<List<GalleryMediaDto>>
    {
    }
}
