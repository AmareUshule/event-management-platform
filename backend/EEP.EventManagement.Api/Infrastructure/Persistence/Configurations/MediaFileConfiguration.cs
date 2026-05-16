using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile>
    {
        public void Configure(EntityTypeBuilder<MediaFile> builder)
        {
            builder.HasKey(m => m.Id);

            builder.Property(m => m.FileName)
                .HasMaxLength(500);

            builder.Property(m => m.FilePath)
                .HasMaxLength(1000);

            builder.Property(m => m.ThumbnailPath)
                .HasMaxLength(1000);

            builder.Property(m => m.FileSize)
                .HasDefaultValue(0);

            builder.HasOne(m => m.Event)
                .WithMany(e => e.MediaFiles)
                .HasForeignKey(m => m.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(m => m.Uploader)
                .WithMany()
                .HasForeignKey(m => m.UploadedBy)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}