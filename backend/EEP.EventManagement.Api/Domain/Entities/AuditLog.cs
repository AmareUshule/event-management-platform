using EEP.EventManagement.Api.Domain.Common;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class AuditLog : BaseEntity
    {
        public Guid UserId { get; set; }
        public string? Action { get; set; }
        public string? Details { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
