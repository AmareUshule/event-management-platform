using EEP.EventManagement.Api.Domain.Common;
using EEP.EventManagement.Api.Domain.Enums;

namespace EEP.EventManagement.Api.Domain.Entities;

public class Event : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    public string Location { get; set; } = string.Empty;

    public EventStatus Status { get; set; }
}
