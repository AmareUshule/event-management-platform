using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverageVerificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VerificationNote",
                table: "Assignments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerifiedAt",
                table: "Assignments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "VerifiedById",
                table: "Assignments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_VerifiedById",
                table: "Assignments",
                column: "VerifiedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignments_AspNetUsers_VerifiedById",
                table: "Assignments",
                column: "VerifiedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignments_AspNetUsers_VerifiedById",
                table: "Assignments");

            migrationBuilder.DropIndex(
                name: "IX_Assignments_VerifiedById",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "VerificationNote",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "VerifiedAt",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "VerifiedById",
                table: "Assignments");
        }
    }
}
