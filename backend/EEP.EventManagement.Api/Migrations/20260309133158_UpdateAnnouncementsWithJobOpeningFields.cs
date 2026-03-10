using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAnnouncementsWithJobOpeningFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Deadline",
                table: "Announcements",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                table: "Announcements",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Announcements",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_DepartmentId",
                table: "Announcements",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Announcements_Departments_DepartmentId",
                table: "Announcements",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Announcements_Departments_DepartmentId",
                table: "Announcements");

            migrationBuilder.DropIndex(
                name: "IX_Announcements_DepartmentId",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Announcements");
        }
    }
}
