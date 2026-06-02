using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Events.Queries
{
    public class GetDiscoveryEventsQuery : IRequest<List<EventDto>>
    {
        public string? SearchTerm { get; set; }
        public string? Category { get; set; }
        public Guid? DepartmentId { get; set; }
        public List<string>? DepartmentNames { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public EventStatus? Status { get; set; }
    }
}
