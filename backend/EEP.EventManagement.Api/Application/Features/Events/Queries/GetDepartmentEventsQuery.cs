using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Events.Queries
{
    public class GetDepartmentEventsQuery : IRequest<List<EventDto>>
    {
        public Guid DepartmentId { get; set; }
    }
}