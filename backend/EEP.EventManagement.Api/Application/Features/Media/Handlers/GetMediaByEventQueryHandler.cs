using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using EEP.EventManagement.Api.Application.Features.Media.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Media.Handlers
{
    public class GetMediaByEventQueryHandler : IRequestHandler<GetMediaByEventQuery, List<MediaFileDto>>
    {
        private readonly IMediaFileRepository _mediaRepository;
        private readonly IMapper _mapper;

        public GetMediaByEventQueryHandler(IMediaFileRepository mediaRepository, IMapper mapper)
        {
            _mediaRepository = mediaRepository;
            _mapper = mapper;
        }

        public async Task<List<MediaFileDto>> Handle(GetMediaByEventQuery request, CancellationToken cancellationToken)
        {
            var media = await _mediaRepository.GetByEventIdAsync(request.EventId);
            return _mapper.Map<List<MediaFileDto>>(media);
        }
    }
}
