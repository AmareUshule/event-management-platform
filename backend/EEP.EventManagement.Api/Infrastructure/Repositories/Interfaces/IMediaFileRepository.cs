using EEP.EventManagement.Api.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces
{
    public interface IMediaFileRepository
    {
        Task<MediaFile> GetByIdAsync(Guid id);
        Task<List<MediaFile>> GetByEventIdAsync(Guid eventId);
        Task<MediaFile> AddAsync(MediaFile entity);
        Task UpdateAsync(MediaFile entity);
        Task DeleteAsync(MediaFile entity);
    }
}
