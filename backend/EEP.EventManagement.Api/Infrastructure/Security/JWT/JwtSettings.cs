namespace EEP.EventManagement.Api.Infrastructure.Security.JWT
{
    public class JwtSettings
    {
        public string Secret { get; set; } = null!;
        public int ExpiryMinutes { get; set; } = 60;
        public string Issuer { get; set; } = null!;
        public string Audience { get; set; } = null!;
    }
}
