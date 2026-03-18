using Microsoft.AspNetCore.Authorization;
using System;

namespace EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements
{
    public class IsAssignedToEventRequirement : IAuthorizationRequirement
    {
        public Guid EventId { get; }

        public IsAssignedToEventRequirement(Guid eventId)
        {
            EventId = eventId;
        }
    }
}
