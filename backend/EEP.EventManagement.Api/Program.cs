using EEP.EventManagement.Api.Application.Features.Events;
using System.Reflection;
using EEP.EventManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Security.Identity; // For ApplicationUser and IdentityDbContext
using Microsoft.AspNetCore.Identity; // For Identity services
using FluentValidation; // For FluentValidation
using FluentValidation.AspNetCore; // For FluentValidation integration
using MediatR; // For MediatR
using EEP.EventManagement.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Infrastructure.Repositories.Implementations;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Register contrllers
// -----------------------------
builder.Services.AddControllers();

// DbContext - Database configuration (using PostgreSQL)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application services
builder.Services.AddScoped<IEventRepository, EventRepository>();

// MediatR
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
    cfg.RegisterServicesFromAssembly(typeof(Application.Features.Auth.Commands.RegisterUserCommand).Assembly); // Register application layer commands/queries
});

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
builder.Services.AddValidatorsFromAssembly(typeof(Application.Features.Auth.Validators.RegisterUserValidator).Assembly);

// ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

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

// Enable HTTPS redirection
app.UseHttpsRedirection();

// -----------------------------
// ENABLE AUTHENTICATION AND AUTHORIZATION
// -----------------------------
app.UseAuthentication();
app.UseAuthorization();

// -----------------------------
// ENABLE CONTROLLERS
// -----------------------------
app.MapControllers();

app.Run();
