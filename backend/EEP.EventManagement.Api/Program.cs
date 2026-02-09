using EEP.EventManagement.Application.Services.Interfaces;
using EEP.EventManagement.Application.Services.Implementations;
using EEP.EventManagement.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Infrastructure.Repositories.Implementations;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// ADD SERVICES
// -----------------------------
builder.Services.AddControllers();

// Application services
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventRepository, EventRepository>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -----------------------------
// MIDDLEWARE
// -----------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// -----------------------------
// API STATUS (simple test)
// -----------------------------
app.MapGet("/api/status", () =>
{
    return Results.Ok(new
    {
        status = "API is running",
        environment = app.Environment.EnvironmentName,
        timestamp = DateTime.UtcNow
    });
});

// -----------------------------
// ENABLE CONTROLLERS
// -----------------------------
app.MapControllers();

app.Run();
