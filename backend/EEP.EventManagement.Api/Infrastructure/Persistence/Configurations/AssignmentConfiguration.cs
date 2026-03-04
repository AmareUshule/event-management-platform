using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
    {
        public void Configure(EntityTypeBuilder<Assignment> builder)
        {
            builder.ToTable("Assignments");

            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).HasColumnName("Id");

            builder.Property(a => a.EventId)
                .IsRequired();

            builder.Property(a => a.EmployeeId)
                .IsRequired();

            builder.Property(a => a.AssignedBy)
                .IsRequired();

            builder.Property(a => a.Status)
                .HasMaxLength(20)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(a => a.Role)
                .HasMaxLength(20)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(a => a.DeclineReason)
                .HasColumnType("text");

            builder.Property(a => a.CreatedAt)
                .HasDefaultValueSql("now()");

            builder.Property(a => a.UpdatedAt)
                .HasDefaultValueSql("now()");

            // Relationships
            builder.HasOne(a => a.Event)
                .WithMany(e => e.Assignments)
                .HasForeignKey(a => a.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.AssignedByUser)
                .WithMany()
                .HasForeignKey(a => a.AssignedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
