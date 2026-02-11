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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EEP.EventManagement.Api.Infrastructure.Security.JWT;
using EEP.EventManagement.Api.Middlewares;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Configure JWT Settings
// -----------------------------
var jwtSettings = new JwtSettings();
builder.Configuration.Bind(nameof(JwtSettings), jwtSettings);
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddScoped<JwtTokenGenerator>();

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
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();

// Register custom authorization handlers
builder.Services.AddScoped<IAuthorizationHandler, EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers.IsCommunicationManagerHandler>();
builder.Services.AddScoped<IAuthorizationHandler, EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers.IsAssignedToEventHandler>();
builder.Services.AddScoped<IAuthorizationHandler, EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers.IsDepartmentManagerOfResourceHandler>();

// MediatR
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
    cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommand).Assembly); // Register application layer commands/queries
    cfg.RegisterServicesFromAssembly(typeof(EEP.EventManagement.Api.Application.Features.Departments.Commands.CreateDepartmentCommand).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(EEP.EventManagement.Api.Application.Features.Auth.Commands.LoginUserCommand).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(EEP.EventManagement.Api.Application.Features.Auth.Commands.LoginUserCommand).Assembly);
});

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
builder.Services.AddValidatorsFromAssembly(typeof(RegisterUserValidator).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(EEP.EventManagement.Api.Application.Features.Departments.Validators.CreateDepartmentCommandValidator).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(EEP.EventManagement.Api.Application.Features.Auth.Validators.UpdateUserCommandValidator).Assembly);

// ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

// Configure Authorization Policies
builder.Services.AddAuthorization(options =>
{
    EEP.EventManagement.Api.Infrastructure.Security.Authorization.AuthorizationPolicies.AddPolicies(options);
});

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
    };
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -----------------------------
// Custom Exception Handling Middleware
// -----------------------------
app.UseMiddleware<ExceptionHandlingMiddleware>();

// -----------------------------
// SEED ROLES
// -----------------------------
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

    string[] roles = { "Admin", "Manager", "Expert", "Cameraman" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }
}


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
