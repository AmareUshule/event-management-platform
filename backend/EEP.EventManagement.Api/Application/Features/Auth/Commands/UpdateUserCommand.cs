using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.Commands
{
    public record UpdateUserCommand(UpdateUserDto UserDto) : IRequest<UserResponseDto>;
}
