using FluentValidation;
using EEP.EventManagement.Api.Application.Features.Departments.Commands;
using System;

namespace EEP.EventManagement.Api.Application.Features.Departments.Validators
{
    public class UpdateDepartmentCommandValidator : AbstractValidator<UpdateDepartmentCommand>
    {
        public UpdateDepartmentCommandValidator()
        {
            RuleFor(p => p.DepartmentDto.Id)
                .NotNull().WithMessage("{PropertyName} is required.")
                .NotEqual(Guid.Empty).WithMessage("{PropertyName} must not be empty.");

            RuleFor(p => p.DepartmentDto.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .NotNull()
                .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.");
        }
    }
}
