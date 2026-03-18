using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAnnouncementTypeToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Departments_DepartmentId",
                table: "Announcements");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Announcements",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "General",
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Departments_DepartmentId",
                table: "Announcements",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Departments_DepartmentId",
                table: "Announcements");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Announcements",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldDefaultValue: "General");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Departments_DepartmentId",
                table: "Announcements",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id");
        }
    }
}
