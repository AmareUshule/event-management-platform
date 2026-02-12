
namespace EEP.EventManagement.Api.Application.Features.Auth.DTOs
{
    public class RegisterUserRequestDto
    {
        public string EmployeeId { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? Email { get; set; }
        public string Password { get; set; } = null!;
        public string ConfirmPassword { get; set; } = null!;
        public string Role { get; set; } = "Staff"; // default role
        public Guid? DepartmentId { get; set; }
    }
}
