using EEP.EventManagement.Api.Application.Features.Events.DTOs;
using FluentValidation;
using System;

namespace EEP.EventManagement.Api.Application.Features.Events.Validators
{
    public class UpdateEventDtoValidator : AbstractValidator<UpdateEventDto>
    {
        public UpdateEventDtoValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Event ID is required.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(150).WithMessage("Title cannot exceed 150 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(2000).WithMessage("Description is too long.");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("Start date is required.");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("End date is required.")
                .GreaterThan(x => x.StartDate).WithMessage("End date must be after the start date.");

            RuleFor(x => x.EventPlace)
                .MaximumLength(255).WithMessage("Event place cannot exceed 255 characters.");

            RuleFor(x => x.DepartmentId)
                .NotEmpty().WithMessage("Department is required.");

            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Invalid event status.");
        }
    }
}