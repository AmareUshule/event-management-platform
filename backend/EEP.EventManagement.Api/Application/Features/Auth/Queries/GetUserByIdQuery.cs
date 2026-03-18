using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;
using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.Queries
{
    public record GetUserByIdQuery(string Id) : IRequest<UserResponseDto>;
}
