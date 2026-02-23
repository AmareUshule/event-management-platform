namespace EEP.EventManagement.Api.Application.Features.Events.DTOs;

public class EventResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid DepartmentId { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string EventPlace { get; set; } = string.Empty;
}