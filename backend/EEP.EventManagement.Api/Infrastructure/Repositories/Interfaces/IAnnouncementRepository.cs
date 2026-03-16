using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces
{
    public interface IAnnouncementRepository
    {
        Task<Announcement?> GetByIdAsync(Guid id, bool includeMediaAndJobs = false);
        Task<(List<Announcement> Items, int TotalCount)> GetPagedAsync(AnnouncementStatus? status, Guid? createdById, int page, int pageSize);
        Task<Announcement> AddAsync(Announcement entity);
        Task UpdateAsync(Announcement entity);
        Task DeleteAsync(Announcement entity);
        Task<bool> ExistsAsync(Guid id);
        Task AddMediaAsync(AnnouncementMedia media);
    }
}
