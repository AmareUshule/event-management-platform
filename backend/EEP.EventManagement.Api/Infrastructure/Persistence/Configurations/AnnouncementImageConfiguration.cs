using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class AnnouncementImageConfiguration : IEntityTypeConfiguration<AnnouncementImage>
    {
        public void Configure(EntityTypeBuilder<AnnouncementImage> builder)
        {
            builder.ToTable("AnnouncementImages");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.ImageUrl)
                .IsRequired();

            builder.Property(i => i.FileName)
                .IsRequired();

            builder.Property(i => i.ContentType)
                .IsRequired();

            builder.Property(i => i.UploadedAt)
                .HasDefaultValueSql("now()");

            builder.Property(i => i.CreatedAt)
                .HasDefaultValueSql("now()");

            builder.Property(i => i.UpdatedAt)
                .HasDefaultValueSql("now()");

            builder.HasOne(i => i.Announcement)
                .WithMany(a => a.Images)
                .HasForeignKey(i => i.AnnouncementId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
