using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using EEP.EventManagement.Api.Application.Features.Assignments.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Handlers
{
    public class GetAssignmentsByEventQueryHandler : IRequestHandler<GetAssignmentsByEventQuery, List<AssignmentDto>>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IMapper _mapper;

        public GetAssignmentsByEventQueryHandler(IAssignmentRepository assignmentRepository, IMapper mapper)
        {
            _assignmentRepository = assignmentRepository;
            _mapper = mapper;
        }

        public async Task<List<AssignmentDto>> Handle(GetAssignmentsByEventQuery request, CancellationToken cancellationToken)
        {
            var assignments = await _assignmentRepository.GetAssignmentsByEventIdAsync(request.EventId);
            return _mapper.Map<List<AssignmentDto>>(assignments);
        }
    }
}
