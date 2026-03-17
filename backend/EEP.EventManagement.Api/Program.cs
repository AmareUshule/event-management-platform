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
using EEP.EventManagement.Api.Infrastructure.Security.Claims;
using EEP.EventManagement.Api.Infrastructure.Security.JWT;
using EEP.EventManagement.Api.Middlewares;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.FileProviders;
using System.IO;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Configure JWT Settings
// -----------------------------
var jwtSettings = new JwtSettings();
builder.Configuration.Bind(nameof(JwtSettings), jwtSettings);
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddScoped<JwtTokenGenerator>();

// ----------------------
// Add cors
// ---------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "http://10.27.52.167:4200",
                "http://10.27.52.230:4200"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// -----------------------------
// Register contrllers
// -----------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });



// DbContext - Database configuration (using PostgreSQL)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, EEP.EventManagement.Api.Infrastructure.Security.UserContext>();
builder.Services.AddScoped<EEP.EventManagement.Api.Application.Services.INotificationService, EEP.EventManagement.Api.Application.Services.NotificationService>();
builder.Services.AddScoped<EEP.EventManagement.Api.Application.Services.IEventLifecycleService, EEP.EventManagement.Api.Application.Services.EventLifecycleService>();
builder.Services.AddHostedService<EEP.EventManagement.Api.Infrastructure.Services.EventStatusUpdateWorker>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();
builder.Services.AddScoped<IMediaFileRepository, MediaFileRepository>();
builder.Services.AddScoped<IAnnouncementRepository, AnnouncementRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<EEP.EventManagement.Api.Infrastructure.Storage.Interfaces.IStorageService, EEP.EventManagement.Api.Infrastructure.Storage.Implementations.LocalStorageService>();

// SignalR
builder.Services.AddSignalR();

// Register custom authorization handlers
builder.Services.AddScoped<IAuthorizationHandler, EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers.IsCommunicationManagerHandler>();
builder.Services.AddScoped<IAuthorizationHandler, EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers.IsAssignedToEventHandler>();
builder.Services.AddScoped<IAuthorizationHandler, EEP.EventManagement.Api.Infrastructure.Security.Authorization.Handlers.IsDepartmentManagerOfResourceHandler>();

// AutoMapper
builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly());

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
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
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

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/notificationHub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// -----------------------------
// Custom Exception Handling Middleware
// -----------------------------
app.UseMiddleware<ExceptionHandlingMiddleware>(app.Environment);

// -----------------------------
// SEED ROLES
// -----------------------------
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

    // Ensure all application roles exist in Identity, including Employee
    string[] roles = { "Admin", "Manager", "Expert", "Cameraman", "Employee" };

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
// SERVE STATIC FILES (For Uploads)
// -----------------------------
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// -----------------------------
// ENABLE CORS
// -----------------------------
app.UseCors("AllowAngularApp");


// -----------------------------
// ENABLE AUTHENTICATION AND AUTHORIZATION
// -----------------------------
app.UseAuthentication();
app.UseAuthorization();

// -----------------------------
// ENABLE CONTROLLERS
// -----------------------------
app.MapControllers();
app.MapHub<EEP.EventManagement.Api.Infrastructure.Notifications.Hubs.NotificationHub>("/notificationHub");

app.Run();
