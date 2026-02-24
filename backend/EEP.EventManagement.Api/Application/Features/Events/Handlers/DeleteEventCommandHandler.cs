using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class DeleteEventCommandHandler : IRequestHandler<DeleteEventCommand, Unit>
    {
        private readonly IEventRepository _eventRepository;

        public DeleteEventCommandHandler(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<Unit> Handle(DeleteEventCommand request, CancellationToken cancellationToken)
        {
            var eventToDelete = await _eventRepository.GetByIdAsync(request.Id);

            if (eventToDelete == null)
            {
                throw new NotFoundException(nameof(Event), request.Id);
            }

            await _eventRepository.DeleteAsync(eventToDelete);

            return Unit.Value;
        }
    }
}