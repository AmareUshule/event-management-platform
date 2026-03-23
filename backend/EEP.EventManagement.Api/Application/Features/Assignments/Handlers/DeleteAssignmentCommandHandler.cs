using AutoMapper;
using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Assignments.Commands;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Assignments.Handlers
{
    public class DeleteAssignmentCommandHandler : IRequestHandler<DeleteAssignmentCommand, EventDto>
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;

        public DeleteAssignmentCommandHandler(
            IAssignmentRepository assignmentRepository,
            IEventRepository eventRepository,
            IMapper mapper)
        {
            _assignmentRepository = assignmentRepository;
            _eventRepository = eventRepository;
            _mapper = mapper;
        }

        public async Task<EventDto> Handle(DeleteAssignmentCommand request, CancellationToken cancellationToken)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
            {
                throw new NotFoundException(nameof(Assignment), request.AssignmentId);
            }

            if (assignment.EventId != request.EventId)
            {
                throw new BadRequestException("Assignment does not belong to the specified event.");
            }

            await _assignmentRepository.DeleteAsync(assignment);

            // Fetch the updated event with its current assignments
            var updatedEvent = await _eventRepository.GetByIdAsync(request.EventId);
            if (updatedEvent == null)
            {
                throw new NotFoundException(nameof(Event), request.EventId);
            }
            
            return _mapper.Map<EventDto>(updatedEvent);
        }
    }
}
