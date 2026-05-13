using System.Threading;
using System.Threading.Tasks;

namespace EEP.EventManagement.Api.Infrastructure.Notifications.Interfaces
{
    public interface IEmailSender
    {
        Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default);
    }
}
