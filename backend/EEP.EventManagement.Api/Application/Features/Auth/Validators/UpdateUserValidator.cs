using FluentValidation;
using EEP.EventManagement.Api.Application.Features.Auth.Commands;
using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.Validators
{
    public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
    {
        public UpdateUserCommandValidator()
        {
            RuleFor(x => x.UserDto.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(x => x.UserDto.FirstName)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.");

            RuleFor(x => x.UserDto.LastName)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.");

            RuleFor(x => x.UserDto.Email)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .EmailAddress().WithMessage("{PropertyName} must be a valid email address.");

            RuleFor(x => x.UserDto.Role)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .Must(BeAValidRole).WithMessage("{PropertyName} must be one of: Admin, Manager, expert, cameraman.");

            RuleFor(x => x.UserDto.DepartmentId)
                .Must(id => !id.HasValue || id.Value != Guid.Empty).WithMessage("{PropertyName} must be a valid GUID or null.");
        }

        private bool BeAValidRole(string role)
        {
            string[] allowedRoles = { "Admin", "Manager", "expert", "cameraman" };
            return allowedRoles.Contains(role);
        }
    }
}
