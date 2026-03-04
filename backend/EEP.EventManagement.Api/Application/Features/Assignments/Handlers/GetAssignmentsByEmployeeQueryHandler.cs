using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using EEP.EventManagement.Api.Application.Features.Assignments.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Handlers
{
    public class GetAssignmentsByEmployeeQueryHandler : IRequestHandler<GetAssignmentsByEmployeeQuery, List<AssignmentDto>>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IMapper _mapper;

        public GetAssignmentsByEmployeeQueryHandler(IAssignmentRepository assignmentRepository, IMapper mapper)
        {
            _assignmentRepository = assignmentRepository;
            _mapper = mapper;
        }

        public async Task<List<AssignmentDto>> Handle(GetAssignmentsByEmployeeQuery request, CancellationToken cancellationToken)
        {
            var assignments = await _assignmentRepository.GetAssignmentsByEmployeeIdAsync(request.EmployeeId);
            return _mapper.Map<List<AssignmentDto>>(assignments);
        }
    }
}
