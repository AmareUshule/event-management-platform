namespace EEP.EventManagement.Api.DTOs.Events;

public class EventResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
