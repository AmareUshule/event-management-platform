using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Departments.Commands
{
    public record DeleteDepartmentCommand(Guid Id) : IRequest<Unit>;
}
