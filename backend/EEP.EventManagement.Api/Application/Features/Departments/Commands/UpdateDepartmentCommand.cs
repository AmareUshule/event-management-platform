using MediatR;
using EEP.EventManagement.Api.Application.Features.Departments.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Departments.Commands
{
    public record UpdateDepartmentCommand(UpdateDepartmentDto DepartmentDto) : IRequest<DepartmentResponseDto>;
}
