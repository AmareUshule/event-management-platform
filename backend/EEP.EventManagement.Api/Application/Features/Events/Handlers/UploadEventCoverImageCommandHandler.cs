using EEP.EventManagement.Api.Application.Exceptions;
using EEP.EventManagement.Api.Application.Features.Events.Commands;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Storage.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class UploadEventCoverImageCommandHandler : IRequestHandler<UploadEventCoverImageCommand, string>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IStorageService _storageService;

        public UploadEventCoverImageCommandHandler(IEventRepository eventRepository, IStorageService storageService)
        {
            _eventRepository = eventRepository;
            _storageService = storageService;
        }

        public async Task<string> Handle(UploadEventCoverImageCommand request, CancellationToken cancellationToken)
        {
            var ev = await _eventRepository.GetByIdAsync(request.EventId);
            if (ev == null)
            {
                throw new NotFoundException("Event", request.EventId);
            }

            var filePath = await _storageService.SaveFileAsync(request.FileStream, request.FileName, $"uploads/events/{ev.Id}/banner");
            
            ev.CoverImageUrl = filePath;
            await _eventRepository.UpdateAsync(ev);

            return filePath;
        }
    }
}
