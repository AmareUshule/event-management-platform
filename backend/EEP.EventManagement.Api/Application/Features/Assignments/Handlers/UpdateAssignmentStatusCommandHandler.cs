using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Assignments.Commands;
using EEP.EventManagement.Api.Application.Features.Assignments.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Handlers
{
    public class UpdateAssignmentStatusCommandHandler : IRequestHandler<UpdateAssignmentStatusCommand, AssignmentDto>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;

        public UpdateAssignmentStatusCommandHandler(
            IAssignmentRepository assignmentRepository,
            IMapper mapper,
            IUserContext userContext)
        {
            _assignmentRepository = assignmentRepository;
            _mapper = mapper;
            _userContext = userContext;
        }

        public async Task<AssignmentDto> Handle(UpdateAssignmentStatusCommand request, CancellationToken cancellationToken)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.UpdateAssignmentStatusDto.Id);
            if (assignment == null)
            {
                throw new NotFoundException("Assignment", request.UpdateAssignmentStatusDto.Id);
            }

            var currentUserId = _userContext.GetUserId();
            if (assignment.EmployeeId != currentUserId)
            {
                throw new UnauthorizedException("You are not authorized to update this assignment status.");
            }

            if (request.UpdateAssignmentStatusDto.Status == AssignmentStatus.Declined && string.IsNullOrWhiteSpace(request.UpdateAssignmentStatusDto.DeclineReason))
            {
                throw new BadRequestException("A reason must be provided when declining an assignment.");
            }

            assignment.Status = request.UpdateAssignmentStatusDto.Status;
            assignment.DeclineReason = request.UpdateAssignmentStatusDto.DeclineReason;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _assignmentRepository.UpdateAsync(assignment);

            var updatedAssignment = await _assignmentRepository.GetByIdAsync(assignment.Id);
            return _mapper.Map<AssignmentDto>(updatedAssignment);
        }
    }
}
