using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.Commands
{
    public record DeleteUserCommand(string Id) : IRequest<Unit>;
}
