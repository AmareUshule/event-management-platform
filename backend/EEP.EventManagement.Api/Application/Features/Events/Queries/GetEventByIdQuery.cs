using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Events.Queries
{
    public class GetEventByIdQuery : IRequest<EventDto>
    {
        public Guid Id { get; set; }
    }
}