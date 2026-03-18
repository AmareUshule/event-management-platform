using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using System;
using System.Linq;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Mappings
{
    public class EventProfile : Profile
    {
        public EventProfile()
        {
            // Event Mapping
            CreateMap<Event, EventDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.TimeStatus, opt => opt.MapFrom(src => 
                    DateTime.UtcNow < src.StartDate ? "Upcoming" :
                    DateTime.UtcNow > src.EndDate ? "Past" : "Ongoing"))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser))
                .ForMember(dest => dest.ApprovedBy, opt => opt.MapFrom(src => src.ApprovedByUser))
                .ForMember(dest => dest.Assignments, opt => opt.MapFrom(src => src.Assignments));

            // Simplified Mappings
            CreateMap<Department, SimplifiedDepartmentDto>();

            CreateMap<ApplicationUser, SimplifiedUserDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

            CreateMap<ApplicationUser, AssignedByDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

            CreateMap<Assignment, SimplifiedAssignmentDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : string.Empty))
                .ForMember(dest => dest.AssignedBy, opt => opt.MapFrom(src => src.AssignedByUser));

            // Grouping logic for assignments
            CreateMap<ICollection<Assignment>, GroupedAssignmentsDto>()
                .ConvertUsing<GroupedAssignmentsConverter>();

            CreateMap<CreateEventDto, Event>().ReverseMap();
            CreateMap<UpdateEventDto, Event>().ReverseMap();
        }
    }

    public class GroupedAssignmentsConverter : ITypeConverter<ICollection<Assignment>, GroupedAssignmentsDto>
    {
        public GroupedAssignmentsDto Convert(ICollection<Assignment> source, GroupedAssignmentsDto destination, ResolutionContext context)
        {
            var result = destination ?? new GroupedAssignmentsDto();
            if (source == null) return result;

            foreach (var a in source)
            {
                var dto = context.Mapper.Map<SimplifiedAssignmentDto>(a);
                if (a.Role == AssignmentRole.Cameraman)
                {
                    result.Cameraman.Add(dto);
                }
                else if (a.Role == AssignmentRole.Expert)
                {
                    result.Expert.Add(dto);
                }
            }
            return result;
        }
    }
}
