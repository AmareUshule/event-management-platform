using AutoMapper;
using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using EEP.EventManagement.Api.Application.Features.Events.Queries;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Application.Features.Events.Handlers
{
    public class GetDiscoveryEventsQueryHandler : IRequestHandler<GetDiscoveryEventsQuery, List<EventDto>>
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IUserContext _userContext;
        private readonly IDepartmentRepository _departmentRepository;

        public GetDiscoveryEventsQueryHandler(
            IEventRepository eventRepository,
            IMapper mapper,
            IUserContext userContext,
            IDepartmentRepository departmentRepository)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
            _userContext = userContext;
            _departmentRepository = departmentRepository;
        }

        public async Task<List<EventDto>> Handle(GetDiscoveryEventsQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Event> query = _eventRepository.GetQueryable();
            query = query.Include(e => e.Department);
            query = query.Include(e => e.CreatedByUser);

            // For the public discovery endpoint, only show events with public-facing statuses.
            // This is a whitelist approach for better security.
            var publicStatuses = new[] {
                EventStatus.Scheduled,
                EventStatus.Ongoing,
                EventStatus.Completed,
                EventStatus.Covered
            };
            query = query.Where(e => publicStatuses.Contains(e.Status));

            // Apply user-specified status filter ONLY if it's one of the public ones
            if (request.Status.HasValue && publicStatuses.Contains(request.Status.Value))
            {
                query = query.Where(e => e.Status == request.Status.Value);
            }

            // Filtering
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var search = request.SearchTerm.ToLower();
                query = query.Where(e =>
                    EF.Functions.ILike(e.Title, $"%{search}%") ||
                    EF.Functions.ILike(e.Description ?? string.Empty, $"%{search}%") ||
                    EF.Functions.ILike(e.EventPlace ?? string.Empty, $"%{search}%")
                );
            }

            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                query = query.Where(e => e.Category == request.Category);
            }

            if (request.DepartmentId.HasValue)
            {
                query = query.Where(e => e.DepartmentId == request.DepartmentId.Value);
            }

            if (request.DepartmentNames != null && request.DepartmentNames.Any())
            {
                query = query.Where(e => request.DepartmentNames.Contains(e.Department.Name));
            }

            if (request.StartDate.HasValue)
            {
                query = query.Where(e => e.StartDate >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                query = query.Where(e => e.EndDate <= request.EndDate.Value);
            }

            var events = await query.OrderByDescending(e => e.StartDate).ToListAsync(cancellationToken);

            return _mapper.Map<List<EventDto>>(events);
        }
    }
}
