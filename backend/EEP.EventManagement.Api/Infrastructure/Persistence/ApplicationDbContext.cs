using EEP.EventManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using EEP.EventManagement.Infrastructure.Repositories.Interfaces;

namespace EEP.EventManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Event> Events => Set<Event>();
}
