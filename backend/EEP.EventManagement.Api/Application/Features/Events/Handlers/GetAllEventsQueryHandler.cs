using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using MediatR;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class GetAllEventsQueryHandler : IRequestHandler<GetAllEventsQuery, List<EventDto>>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;

        public GetAllEventsQueryHandler(IEventRepository eventRepository, IMapper mapper)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
        }

        public async Task<List<EventDto>> Handle(GetAllEventsQuery request, CancellationToken cancellationToken)
        {
            var query = _eventRepository.GetQueryable();

            // Include relations for DTO mapping
            query = query.Include(e => e.Department)
                         .Include(e => e.CreatedByUser)
                         .Include(e => e.ApprovedByUser)
                         .Include(e => e.Assignments)
                            .ThenInclude(a => a.Employee);

            // 1. Status Filter
            if (request.Status.HasValue)
            {
                query = query.Where(e => e.Status == request.Status.Value);
            }

            // 2. Draft Privacy (Global Rule)
            if (!request.IncludeDrafts)
            {
                query = query.Where(e => e.Status != EventStatus.Draft);
            }

            // 3. Search Term (Title, Description, Place)
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var search = request.SearchTerm.ToLower();
                query = query.Where(e => 
                    EF.Functions.ILike(e.Title, $"%{search}%") || 
                    EF.Functions.ILike(e.Description ?? string.Empty, $"%{search}%") ||
                    EF.Functions.ILike(e.EventPlace ?? string.Empty, $"%{search}%")
                );
            }

            // 4. Category Filter
            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                query = query.Where(e => e.Category == request.Category);
            }

            // 5. Department Filter
            if (request.DepartmentId.HasValue)
            {
                query = query.Where(e => e.DepartmentId == request.DepartmentId.Value);
            }

            // 6. Date Range Filter
            if (request.StartDate.HasValue)
            {
                query = query.Where(e => e.StartDate >= request.StartDate.Value);
            }
            if (request.EndDate.HasValue)
            {
                query = query.Where(e => e.EndDate <= request.EndDate.Value);
            }

            var events = await query.OrderByDescending(e => e.StartDate).ToListAsync(cancellationToken);

            return _mapper.Map<List<EventDto>>(events) ?? new List<EventDto>();
        }
    }
}