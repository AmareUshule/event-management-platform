using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class AnnouncementMediaConfiguration : IEntityTypeConfiguration<AnnouncementMedia>
    {
        public void Configure(EntityTypeBuilder<AnnouncementMedia> builder)
        {
            builder.HasKey(am => am.Id);

            builder.Property(am => am.FileUrl)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(am => am.FileName)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(am => am.FileType)
                .IsRequired()
                .HasMaxLength(50); // "Image" or "Pdf"

            builder.Property(am => am.ContentType)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(am => am.UploadedAt)
                .IsRequired();
            
            builder.Property(am => am.UploadedBy)
                .IsRequired();

            builder.HasOne(am => am.Announcement)
                .WithMany(a => a.Media)
                .HasForeignKey(am => am.AnnouncementId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
