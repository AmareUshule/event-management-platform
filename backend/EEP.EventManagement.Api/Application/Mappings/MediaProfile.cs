using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using EEP.EventManagement.Api.Domain.Entities;

namespace EEP.EventManagement.Api.Application.Mappings
{
    public class MediaProfile : Profile
    {
        public MediaProfile()
        {
            CreateMap<MediaFile, MediaFileDto>()
                .ForMember(dest => dest.UploaderName,
                    opt => opt.MapFrom(src => src.Uploader != null ? $"{src.Uploader.FirstName} {src.Uploader.LastName}" : null))
                .ForMember(dest => dest.UploaderFirstName,
                    opt => opt.MapFrom(src => src.Uploader != null ? src.Uploader.FirstName : null))
                .ForMember(dest => dest.UploaderLastName,
                    opt => opt.MapFrom(src => src.Uploader != null ? src.Uploader.LastName : null));
        }
    }
}
