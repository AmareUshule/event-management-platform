using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddJobRelatedFieldsToAnnouncement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
