using MediatR;
using EEP.EventManagement.Api.Application.Features.Departments.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Departments.Commands
{
    public record CreateDepartmentCommand(CreateDepartmentDto DepartmentDto) : IRequest<DepartmentResponseDto>;
}
