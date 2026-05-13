using EEP.EventManagement.Api.Configurations;
using EEP.EventManagement.Api.Infrastructure.Notifications.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace EEP.EventManagement.Api.Infrastructure.Notifications.Implementations
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(IOptions<EmailSettings> options, ILogger<SmtpEmailSender> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
        {
            if (!_settings.Enabled)
            {
                _logger.LogDebug("Email notification skipped because email sending is disabled.");
                return;
            }

            if (string.IsNullOrWhiteSpace(toEmail))
            {
                _logger.LogDebug("Email notification skipped because the recipient email is empty.");
                return;
            }

            if (string.IsNullOrWhiteSpace(_settings.Host) || string.IsNullOrWhiteSpace(_settings.FromEmail))
            {
                _logger.LogWarning("Email notification skipped because SMTP host or from email is not configured.");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("plain")
            {
                Text = body
            };

            using var client = new SmtpClient();
            var secureSocketOptions = GetSecureSocketOptions();

            await client.ConnectAsync(_settings.Host, _settings.Port, secureSocketOptions, cancellationToken);

            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
        }

        private SecureSocketOptions GetSecureSocketOptions()
        {
            if (!_settings.EnableSsl)
            {
                return SecureSocketOptions.None;
            }

            return _settings.Port == 465
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTlsWhenAvailable;
        }
    }
}
