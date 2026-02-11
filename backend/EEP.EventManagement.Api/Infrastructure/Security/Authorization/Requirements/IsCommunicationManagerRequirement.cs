using Microsoft.AspNetCore.Authorization;

namespace EEP.EventManagement.Api.Infrastructure.Security.Authorization.Requirements
{
    public class IsCommunicationManagerRequirement : IAuthorizationRequirement
    {
        public IsCommunicationManagerRequirement() { }
    }
}
