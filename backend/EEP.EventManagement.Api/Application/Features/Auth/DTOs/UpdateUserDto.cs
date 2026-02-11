using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.DTOs
{
    public class UpdateUserDto
    {
        public string Id { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public Guid? DepartmentId { get; set; }
    }
}
