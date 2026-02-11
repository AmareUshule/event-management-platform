using EEP.EventManagement.Api.Application.Features.Auth.Commands;
using EEP.EventManagement.Api.Application.Features.Auth.Validators;
using EEP.EventManagement.Api.Application.Features.Events;
using EEP.EventManagement.Api.Infrastructure.Persistence;
using EEP.EventManagement.Api.Infrastructure.Repositories.Implementations;
using EEP.EventManagement.Api.Infrastructure.Repositories.Interfaces;
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

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
    cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommand).Assembly); // Register application layer commands/queries
});

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
builder.Services.AddValidatorsFromAssembly(typeof(RegisterUserValidator).Assembly);

// ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>()
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
