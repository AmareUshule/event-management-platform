using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAnnouncementMediaAndJobVacancy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnnouncementImages");

            migrationBuilder.DropColumn(
                name: "Certificate",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Experience",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "JobCode",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "OtherOptionalRequirements",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "RequiredNumber",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Requirements",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Training",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "WorkPlace",
                table: "Announcements");

            migrationBuilder.AddColumn<string>(
                name: "CoverImageUrl",
                table: "Announcements",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AnnouncementMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AnnouncementId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    FileName = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    FileType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnnouncementMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnnouncementMedia_Announcements_AnnouncementId",
                        column: x => x.AnnouncementId,
                        principalTable: "Announcements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobVacancies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AnnouncementId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobTitle = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    JobCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Grade = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RequiredNumber = table.Column<int>(type: "integer", nullable: false),
                    WorkPlace = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Requirements = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Experience = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Training = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Certificate = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    OtherOptionalRequirements = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    WorkUnit = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobVacancies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobVacancies_Announcements_AnnouncementId",
                        column: x => x.AnnouncementId,
                        principalTable: "Announcements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementMedia_AnnouncementId",
                table: "AnnouncementMedia",
                column: "AnnouncementId");

            migrationBuilder.CreateIndex(
                name: "IX_JobVacancies_AnnouncementId",
                table: "JobVacancies",
                column: "AnnouncementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnnouncementMedia");

            migrationBuilder.DropTable(
                name: "JobVacancies");

            migrationBuilder.DropColumn(
                name: "CoverImageUrl",
                table: "Announcements");

            migrationBuilder.AddColumn<string>(
                name: "Certificate",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Experience",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JobCode",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherOptionalRequirements",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequiredNumber",
                table: "Announcements",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Requirements",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Training",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkPlace",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AnnouncementImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AnnouncementId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnnouncementImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnnouncementImages_Announcements_AnnouncementId",
                        column: x => x.AnnouncementId,
                        principalTable: "Announcements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementImages_AnnouncementId",
                table: "AnnouncementImages",
                column: "AnnouncementId");
        }
    }
}
