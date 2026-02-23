using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.ToTable("Events");

            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("event_id");

            builder.Property(e => e.Title)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(e => e.Description)
                .HasColumnType("text");

            builder.Property(e => e.DepartmentId)
                .IsRequired();

            builder.Property(e => e.StartDate)
                .IsRequired();

            builder.Property(e => e.EndDate)
                .IsRequired();

            builder.Property(e => e.Status)
                .HasMaxLength(20)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(e => e.CreatedBy)
                .IsRequired();

            builder.Property(e => e.EventPlace)
                .HasMaxLength(255);

            builder.HasOne(e => e.Department)
                .WithMany()
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.ApprovedByUser)
                .WithMany()
                .HasForeignKey(e => e.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
