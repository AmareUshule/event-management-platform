using MediatR;
using System;

namespace EEP.EventManagement.Api.Application.Features.Media.Commands
{
    public class DeleteMediaCommand : IRequest<bool>
    {
        public Guid MediaId { get; set; }
    }
}
