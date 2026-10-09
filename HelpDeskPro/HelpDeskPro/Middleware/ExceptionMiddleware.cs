using System.Net;
using System.Text.Json;

namespace HelpDeskPro.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An unhandled exception occurred.");

            await HandleExceptionAsync(context);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context)
    {
        context.Response.StatusCode =
            (int)HttpStatusCode.InternalServerError;

        context.Response.ContentType =
            "application/json";

        var response = new
        {
            statusCode = 500,
            message = "An unexpected error occurred.",
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(response);

        await context.Response.WriteAsync(json);
    }

}
