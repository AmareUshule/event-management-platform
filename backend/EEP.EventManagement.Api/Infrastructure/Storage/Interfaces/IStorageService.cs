using System;
using System.IO;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Storage.Interfaces
{
    public interface IStorageService
    {
        Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderPath);
        Task DeleteFileAsync(string filePath);
    }
}
