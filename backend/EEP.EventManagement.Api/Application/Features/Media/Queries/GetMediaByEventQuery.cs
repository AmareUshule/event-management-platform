using EEP.EventManagement.Api.Application.Features.Media.DTOs;
using MediatR;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Media.Queries
{
    public class GetMediaByEventQuery : IRequest<List<MediaFileDto>>
    {
        public Guid EventId { get; set; }
    }
}
