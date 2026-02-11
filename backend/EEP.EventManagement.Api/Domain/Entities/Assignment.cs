using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using System;

namespace EEP.EventManagement.Api.Domain.Entities
{
    public class Assignment : BaseEntity
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public AssignmentStatus Status { get; set; }
        public Guid EventId { get; set; }
        public Event? Event { get; set; }
        public Guid UserId { get; set; }
        public ApplicationUser? User { get; set; }
    }
}
