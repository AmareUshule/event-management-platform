using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;

namespace EEP.EventManagement.Api.Application.Mappings
{
    public class AnnouncementProfile : Profile
    {
        public AnnouncementProfile()
        {
            CreateMap<Announcement, AnnouncementDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser))
                .ForMember(dest => dest.ApprovedBy, opt => opt.MapFrom(src => src.ApprovedByUser))
                .ForMember(dest => dest.Media, opt => opt.MapFrom(src => src.Media))
                .ForMember(dest => dest.JobVacancies, opt => opt.MapFrom(src => src.JobVacancies))
                .ForMember(dest => dest.CoverImageUrl, opt => opt.MapFrom(src => src.CoverImageUrl ?? "uploads/announcements/default-announcement.png"));

            CreateMap<CreateAnnouncementDto, Announcement>()
                .ForMember(dest => dest.JobVacancies, opt => opt.Ignore()); // JobVacancies are added in the handler

            CreateMap<UpdateAnnouncementDto, Announcement>();

            CreateMap<AnnouncementMedia, AnnouncementMediaDto>();
            CreateMap<JobVacancy, JobVacancyDto>();
            CreateMap<JobVacancyDto, JobVacancy>();

            CreateMap<ApplicationUser, AnnouncementUserDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
        }
    }
}
