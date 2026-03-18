using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Auth.Commands
{
    public class RegisterUserCommand : IRequest<UserResponseDto>
    {
        public RegisterUserRequestDto UserDto { get; set; }

        public RegisterUserCommand(RegisterUserRequestDto dto)
        {
            UserDto = dto;
        }
    }
}
