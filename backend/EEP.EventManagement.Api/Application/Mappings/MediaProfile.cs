using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using EEP.EventManagement.Api.Domain.Entities;

namespace EEP.EventManagement.Api.Application.Mappings
{
    public class MediaProfile : Profile
    {
        public MediaProfile()
        {
            CreateMap<MediaFile, MediaFileDto>();
        }
    }
}
