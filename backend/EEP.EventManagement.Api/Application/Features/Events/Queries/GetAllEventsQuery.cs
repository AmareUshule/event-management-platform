using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Events.Queries
{
    public class GetAllEventsQuery : IRequest<List<EventDto>>
    {
        public EventStatus? Status { get; set; }
        public string? SearchTerm { get; set; }
        public string? Category { get; set; }
        public Guid? DepartmentId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IncludeDrafts { get; set; } = false;
    }
}