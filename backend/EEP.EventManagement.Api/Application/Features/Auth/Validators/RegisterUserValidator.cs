using FluentValidation;
using EEP.EventManagement.Api.Application.Features.Auth.DTOs;

namespace EEP.EventManagement.Api.Application.Features.Auth.Validators
{
    public class RegisterUserValidator : AbstractValidator<RegisterUserRequestDto>
    {
        public RegisterUserValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.Password)
                .WithMessage("Passwords do not match.");
            RuleFor(x => x.Role).NotEmpty();
        }
    }
}
