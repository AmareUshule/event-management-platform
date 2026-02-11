namespace EEP.EventManagement.Api.Application.Features.Auth.DTOs
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
