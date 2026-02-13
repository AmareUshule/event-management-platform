
namespace EEP.EventManagement.Api.Application.Exceptions
{
    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message)
        {
            Errors = new List<string>();
        }

        public BadRequestException(string message, IReadOnlyList<string> errors) : base(message)
        {
            Errors = errors;
        }

        public IReadOnlyList<string> Errors { get; }
    }
}
