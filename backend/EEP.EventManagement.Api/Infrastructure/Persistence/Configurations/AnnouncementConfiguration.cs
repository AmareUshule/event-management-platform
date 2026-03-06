using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> builder)
        {
            builder.ToTable("Announcements");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.Title)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(a => a.Content)
                .HasColumnType("text")
                .IsRequired();

            builder.Property(a => a.Status)
                .HasMaxLength(20)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(a => a.CreatedBy)
                .IsRequired();

            builder.Property(a => a.CreatedAt)
                .HasDefaultValueSql("now()");

            builder.Property(a => a.UpdatedAt)
                .HasDefaultValueSql("now()");

            builder.HasOne(a => a.CreatedByUser)
                .WithMany()
                .HasForeignKey(a => a.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.ApprovedByUser)
                .WithMany()
                .HasForeignKey(a => a.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(a => a.Images)
                .WithOne(i => i.Announcement)
                .HasForeignKey(i => i.AnnouncementId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
