using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Notifications.DTOs;
using EEP.EventManagement.Api.Domain.Entities;

namespace EEP.EventManagement.Api.Application.Mappings
{
    public class NotificationProfile : Profile
    {
        public NotificationProfile()
        {
            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
        }
    }
}
