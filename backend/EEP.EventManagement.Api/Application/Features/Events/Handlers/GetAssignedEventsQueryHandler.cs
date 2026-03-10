using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class GetAssignedEventsQueryHandler : IRequestHandler<GetAssignedEventsQuery, List<EventDto>>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;

        public GetAssignedEventsQueryHandler(IEventRepository eventRepository, IMapper mapper)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
        }

        public async Task<List<EventDto>> Handle(GetAssignedEventsQuery request, CancellationToken cancellationToken)
        {
            var events = await _eventRepository.GetByEmployeeIdAsync(request.EmployeeId);
            return _mapper.Map<List<EventDto>>(events);
        }
    }
}