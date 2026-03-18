using MediatR;
using EEP.EventManagement.Api.Application.Features.Departments.Commands;
using EEP.EventManagement.Api.Application.Features.Departments.DTOs;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Application.Exceptions;
using System;

namespace EEP.EventManagement.Api.Application.Features.Departments.Handlers
{
    public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, DepartmentResponseDto>
    {
        private readonly IDepartmentRepository _departmentRepository;

        public UpdateDepartmentCommandHandler(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task<DepartmentResponseDto> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
        {
            var department = await _departmentRepository.GetByIdAsync(request.DepartmentDto.Id);
            if (department == null)
            {
                throw new NotFoundException($"Department with ID {request.DepartmentDto.Id} not found.");
            }

            // Check if a department with the new name already exists (and is not the current department)
            var existingDepartment = await _departmentRepository.GetByNameAsync(request.DepartmentDto.Name);
            if (existingDepartment != null && existingDepartment.Id != department.Id)
            {
                throw new BadRequestException($"Department with name '{request.DepartmentDto.Name}' already exists.");
            }

            department.Name = request.DepartmentDto.Name;
            department.Description = request.DepartmentDto.Description;
            department.UpdatedAt = DateTime.UtcNow;

            await _departmentRepository.UpdateAsync(department);

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
