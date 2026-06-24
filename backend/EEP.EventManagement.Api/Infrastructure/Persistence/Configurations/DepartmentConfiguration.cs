// EEP.EventManagement.Api/Infrastructure/Persistence/Configurations/DepartmentConfiguration.cs
using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            // Explicitly set the table name to "Departments" to match the database migration.
            builder.ToTable("Departments");

            builder.HasKey(d => d.Id);

            builder.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(d => d.Name)
                .IsUnique();
        }
    }
}
