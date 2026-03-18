using EEP.EventManagement.Api.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Services
{
    public class EventStatusUpdateWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EventStatusUpdateWorker> _logger;

        public EventStatusUpdateWorker(IServiceProvider serviceProvider, ILogger<EventStatusUpdateWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Event Status Update Worker is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var lifecycleService = scope.ServiceProvider.GetRequiredService<IEventLifecycleService>();
                        await lifecycleService.ProcessAutomaticTransitionsAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while updating event statuses.");
                }

                // Wait for 1 minute before next check
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }

            _logger.LogInformation("Event Status Update Worker is stopping.");
        }
    }
}
