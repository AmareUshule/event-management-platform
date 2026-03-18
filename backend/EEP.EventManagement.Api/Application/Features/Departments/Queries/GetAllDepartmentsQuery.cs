using MediatR;
using EEP.EventManagement.Api.Application.Features.Departments.DTOs;
using System.Collections.Generic;

namespace EEP.EventManagement.Api.Application.Features.Departments.Queries
{
    public record GetAllDepartmentsQuery() : IRequest<List<DepartmentResponseDto>>;
}
