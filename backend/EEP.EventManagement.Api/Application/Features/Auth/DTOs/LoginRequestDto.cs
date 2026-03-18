namespace EEP.EventManagement.Api.Application.Features.Auth.DTOs
{
    public class LoginRequestDto
    {
        public string EmployeeId { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
