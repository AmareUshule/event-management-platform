using EEP.EventManagement.Api.Infrastructure.Storage.Interfaces;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Storage.Implementations
{
    public class LocalStorageService : IStorageService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public LocalStorageService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderPath)
        {
            var rootPath = _webHostEnvironment.ContentRootPath;
            var fullFolderPath = Path.Combine(rootPath, folderPath.TrimStart('/'));

            if (!Directory.Exists(fullFolderPath))
            {
                Directory.CreateDirectory(fullFolderPath);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(fullFolderPath, uniqueFileName);

            using (var destinationStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(destinationStream);
            }

            // Return the relative path or URL
            return Path.Combine(folderPath, uniqueFileName).Replace("\\", "/");
        }

        public Task DeleteFileAsync(string filePath)
        {
            var rootPath = _webHostEnvironment.ContentRootPath;
            var fullPath = Path.Combine(rootPath, filePath.TrimStart('/'));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            return Task.CompletedTask;
        }
    }
}
