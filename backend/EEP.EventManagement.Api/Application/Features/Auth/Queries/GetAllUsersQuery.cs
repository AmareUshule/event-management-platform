using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Auth.Queries
{
    public record GetAllUsersQuery() : IRequest<List<UserResponseDto>>;
}
