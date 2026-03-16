using System;

namespace EEP.EventManagement.Api.Application.Features.Announcements.DTOs
{
    public class CreateJobVacancyDto
    {
        public string JobTitle { get; set; } = string.Empty;
        public string JobCode { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public int RequiredNumber { get; set; }
        public string WorkPlace { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;
        public string Training { get; set; } = string.Empty;
        public string Certificate { get; set; } = string.Empty;
        public string OtherOptionalRequirements { get; set; } = string.Empty;
        public string WorkUnit { get; set; } = string.Empty;
    }
}
