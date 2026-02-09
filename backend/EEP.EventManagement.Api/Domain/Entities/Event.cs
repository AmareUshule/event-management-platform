using EEP.EventManagement.Domain.Enums;

namespace EEP.EventManagement.Domain.Entities;

public class Event
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    public string Location { get; set; } = string.Empty;

    public EventStatus Status { get; set; }
}
