using MediatR;
using EEP.EventManagement.Api.Application.Features.Departments.Commands;
using EEP.EventManagement.Api.Application.Features.Departments.DTOs;
using EEP.EventManagement.Api.Domain.Entities;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Application.Exceptions;

namespace EEP.EventManagement.Api.Application.Features.Departments.Handlers
{
    public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, DepartmentResponseDto>
    {
        private readonly IDepartmentRepository _departmentRepository;

        public CreateDepartmentCommandHandler(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task<DepartmentResponseDto> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
        {
            // Check if department with the same name already exists
            var existingDepartment = await _departmentRepository.GetByNameAsync(request.DepartmentDto.Name);
            if (existingDepartment != null)
            {
                throw new BadRequestException($"Department with name '{request.DepartmentDto.Name}' already exists.");
            }

            var department = new Department
            {
                Id = Guid.NewGuid(),
                Name = request.DepartmentDto.Name,
                Description = request.DepartmentDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _departmentRepository.AddAsync(department);

            return new DepartmentResponseDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt
            };
        }
    }
}
