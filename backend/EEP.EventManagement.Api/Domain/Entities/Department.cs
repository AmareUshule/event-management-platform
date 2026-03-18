// EEP.EventManagement.Api/Domain/Entities/Department.cs
using EEP.EventManagement.Api.Domain.Common;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Department : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
