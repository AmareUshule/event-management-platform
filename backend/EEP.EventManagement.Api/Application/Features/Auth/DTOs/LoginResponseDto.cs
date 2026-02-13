using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string EmployeeId { get; set; } = null!;
        public Guid? DepartmentId { get; set; }
    }
}
