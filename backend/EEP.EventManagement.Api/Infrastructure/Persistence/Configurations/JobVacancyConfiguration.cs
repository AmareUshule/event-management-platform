using EEP.EventManagement.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EEP.EventManagement.Api.Infrastructure.Persistence.Configurations
{
    public class JobVacancyConfiguration : IEntityTypeConfiguration<JobVacancy>
    {
        public void Configure(EntityTypeBuilder<JobVacancy> builder)
        {
            builder.HasKey(jv => jv.Id);

            builder.Property(jv => jv.JobTitle)
                .HasMaxLength(250)
                .IsRequired();

            builder.Property(jv => jv.JobCode)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(jv => jv.Grade)
                .HasMaxLength(50);

            builder.Property(jv => jv.WorkPlace)
                .HasMaxLength(250)
                .IsRequired();

            builder.Property(jv => jv.Requirements)
                .HasMaxLength(1000);

            builder.Property(jv => jv.Experience)
                .HasMaxLength(1000);

            builder.Property(jv => jv.Training)
                .HasMaxLength(1000);

            builder.Property(jv => jv.Certificate)
                .HasMaxLength(1000);

            builder.Property(jv => jv.OtherOptionalRequirements)
                .HasMaxLength(1000);
            
            builder.Property(jv => jv.WorkUnit)
                .HasMaxLength(250);

            builder.HasOne(jv => jv.Announcement)
                .WithMany(a => a.JobVacancies)
                .HasForeignKey(jv => jv.AnnouncementId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
