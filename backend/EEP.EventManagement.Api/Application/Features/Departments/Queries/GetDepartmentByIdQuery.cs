using MediatR;
using EEP.EventManagement.Api.Application.Features.Departments.DTOs;
using System;

namespace EEP.EventManagement.Api.Application.Features.Departments.Queries
{
    public record GetDepartmentByIdQuery(Guid Id) : IRequest<DepartmentResponseDto>;
}
