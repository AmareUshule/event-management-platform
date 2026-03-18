using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Events.Queries
{
    public class GetUpcomingEventsQuery : IRequest<List<EventDto>>
    {
    }
}
