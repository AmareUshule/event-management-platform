using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using EEP.EventManagement.Api.Application.Exceptions;
using Microsoft.AspNetCore.Mvc; // For ProblemDetails

namespace EEP.EventManagement.Api.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHostEnvironment _env;

        public ExceptionHandlingMiddleware(RequestDelegate next, IHostEnvironment env)
        {
            _next = next;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(httpContext, ex, _env);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception, IHostEnvironment env)
        {
            context.Response.ContentType = "application/json";
            var statusCode = (int)HttpStatusCode.InternalServerError;
            var title = "An error occurred.";
            var detail = "An unexpected internal server error has occurred.";
            var errors = new Dictionary<string, string[]>();
            var traceId = Guid.NewGuid().ToString();

            if (env.IsDevelopment())
            {
                detail = exception.Message;
                // Include stack trace in development
                errors["StackTrace"] = new[] { exception.ToString() };
            }

            switch (exception)
            {
                case NotFoundException notFoundException:
                    statusCode = (int)HttpStatusCode.NotFound;
                    title = "Not Found";
                    detail = notFoundException.Message;
                    break;
                case BadRequestException badRequestException:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    title = "Bad Request";
                    detail = badRequestException.Message;
                    if (badRequestException.Errors != null && badRequestException.Errors.Any())
                    {
                        errors["Errors"] = badRequestException.Errors.ToArray();
                    }
                    break;
                case UnauthorizedException unauthorizedException:
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    title = "Unauthorized";
                    detail = unauthorizedException.Message;
                    break;
                // Add more custom exceptions here if needed
                default:
                    // For generic exceptions, keep the title and detail as internal server error
                    break;
            }

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Instance = context.Request.Path,
                Type = $"https://httpstatuses.com/{statusCode}", // Standardized URL for status codes
                Extensions = { { "traceId", traceId } }
            };

            // Add validation errors if present
            if (errors.Count > 0)
            {
                problemDetails.Extensions.Add("errors", errors);
            }

            context.Response.StatusCode = statusCode;
            return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions { WriteIndented = env.IsDevelopment() }));
        }
    }
}
