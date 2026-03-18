using System;

namespace EEP.EventManagement.Api.Application.Features.Departments.DTOs
{
    public class UpdateDepartmentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
