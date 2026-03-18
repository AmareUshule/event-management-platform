using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using EEP.EventManagement.Api.Domain.Enums;
using MediatR;
using System;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Queries
{
    public class GetAnnouncementsPagedQuery : IRequest<(List<AnnouncementDto> Items, int TotalCount)>
    {
        public AnnouncementStatus? Status { get; set; }
        public Guid? CreatedById { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class GetAnnouncementByIdQuery : IRequest<AnnouncementDto?>
    {
        public Guid Id { get; set; }
        public bool IncludeDetails { get; set; } = false;
    }

    public class GetJobVacanciesQuery : IRequest<List<JobVacancyDto>>
    {
        public Guid AnnouncementId { get; set; }
    }
}
