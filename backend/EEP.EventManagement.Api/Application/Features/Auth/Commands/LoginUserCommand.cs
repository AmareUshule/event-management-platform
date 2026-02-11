using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Auth.Commands
{
    public record LoginUserCommand(LoginRequestDto LoginDto) : IRequest<LoginResponseDto>;
}
