// EEP.EventManagement.Api/Infrastructure/Persistence/Configurations/ApplicationUserConfiguration.cs
using EEP.EventManagement.Api.Infrastructure.Security.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> builder)
        {
            // This is the correct place to configure the relationship.
            // It configures a one-to-many relationship from the "many" side (ApplicationUser).
            // The .WithMany() call without an argument signifies that there is no
            // navigation collection property on the other side (Department).
            builder.HasOne(u => u.Department)
                   .WithMany() // No navigation property on Department
                   .HasForeignKey(u => u.DepartmentId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
