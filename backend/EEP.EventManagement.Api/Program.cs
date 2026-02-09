using EEP.EventManagement.Api.Application.Features.Events;
using EEP.EventManagement.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Infrastructure.Repositories.Implementations;
using System.Reflection;
using EEP.EventManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Register contrllers
// -----------------------------
builder.Services.AddControllers();

// DbContext - Database configuration (using InMemory)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseInMemoryDatabase("EventManagementDb"));

// Application services
builder.Services.AddScoped<IEventRepository, EventRepository>();

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

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
// ENABLE CONTROLLERS
// -----------------------------
app.MapControllers();

app.Run();
