using MediatR;
using EEP.EventManagement.Api.Application.Features.Auth.Commands;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.AspNetCore.Identity;
using EEP.EventManagement.Api.Application.Exceptions;
using System;

namespace EEP.EventManagement.Api.Application.Features.Auth.Handlers
{
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Unit>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public DeleteUserCommandHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.Id);
            if (user == null)
            {
                throw new NotFoundException($"User with ID {request.Id} not found.");
            }

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));
            }

            return Unit.Value;
        }
    }
}
