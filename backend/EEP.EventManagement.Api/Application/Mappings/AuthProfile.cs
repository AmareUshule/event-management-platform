using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using EEP.EventManagement.Api.Application.Features.Auth.MappingResolvers;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;

namespace EEP.EventManagement.Api.Application.Mappings
{
    public class AuthProfile : Profile
    {
        public AuthProfile()
        {
            CreateMap<ApplicationUser, UserResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.Role, opt => opt.MapFrom<UserRoleResolver>());
        }
    }
}
