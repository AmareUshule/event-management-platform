using EEP.EventManagement.Api.Application.Features.Announcements.DTOs;
using FluentValidation;

namespace EEP.EventManagement.Api.Application.Features.Announcements.Validators
{
    public class CreateAnnouncementValidator : AbstractValidator<CreateAnnouncementDto>
    {
        public CreateAnnouncementValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Content is required.");
        }
    }

    public class UpdateAnnouncementValidator : AbstractValidator<UpdateAnnouncementDto>
    {
        public UpdateAnnouncementValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Content is required.");
        }
    }
}
