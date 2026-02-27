using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Events.Commands
{
    public class DeleteEventCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }
}