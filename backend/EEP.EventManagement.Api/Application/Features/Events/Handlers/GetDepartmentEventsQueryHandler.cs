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
    public class GetDepartmentEventsQueryHandler : IRequestHandler<GetDepartmentEventsQuery, List<EventDto>>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;

        public GetDepartmentEventsQueryHandler(IEventRepository eventRepository, IMapper mapper)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
        }

        public async Task<List<EventDto>> Handle(GetDepartmentEventsQuery request, CancellationToken cancellationToken)
        {
            var events = await _eventRepository.GetByDepartmentIdAsync(request.DepartmentId);
            return _mapper.Map<List<EventDto>>(events);
        }
    }
}