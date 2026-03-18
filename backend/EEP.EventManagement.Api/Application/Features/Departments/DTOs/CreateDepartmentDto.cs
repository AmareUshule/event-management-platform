namespace EEP.EventManagement.Api.Application.Features.Departments.DTOs
{
    public class CreateDepartmentDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
