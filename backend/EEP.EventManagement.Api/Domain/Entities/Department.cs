// EEP.EventManagement.Api/Domain/Entities/Department.cs
using EEP.EventManagement.Api.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace EEP.EventManagement.Api.Domain.Entities
{
    [Table("Departments")]
    public class Department : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
