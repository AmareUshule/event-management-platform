using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Security.Identity; // For ApplicationUser
using EEP.EventManagement.Api.Application.Features.Auth.DTOs; // For UserResponseDto
using EEP.EventManagement.Api.Application.Features.Departments.DTOs; // For DepartmentResponseDto
using EEP.EventManagement.Api.Application.Features.Auth.MappingResolvers; // For UserRoleResolver

namespace EEP.EventManagement.Api.Application.Mappings
{
    public class EventProfile : Profile
    {
        public EventProfile()
        {
            // Event Mappings
            CreateMap<Event, EventDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser)) // Map CreatedByUser entity to CreatedBy DTO
                .ForMember(dest => dest.ApprovedBy, opt => opt.MapFrom(src => src.ApprovedByUser)); // Map ApprovedByUser entity to ApprovedBy DTO


            CreateMap<CreateEventDto, Event>().ReverseMap();
            CreateMap<UpdateEventDto, Event>().ReverseMap();

            // Other Mappings
            CreateMap<ApplicationUser, UserResponseDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom<UserRoleResolver>());
            CreateMap<Department, DepartmentResponseDto>();
        }
    }
}