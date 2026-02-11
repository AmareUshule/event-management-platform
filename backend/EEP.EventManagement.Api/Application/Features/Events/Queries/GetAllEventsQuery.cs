
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Events.Queries
{
    public class GetAllEventsQuery : IRequest<List<EventResponseDto>>
    {
    }
}
