using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClosureCommentToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClosureComment",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FinalizedBy",
                table: "Events",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FinalizedByUserId",
                table: "Events",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_FinalizedByUserId",
                table: "Events",
                column: "FinalizedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_FinalizedByUserId",
                table: "Events",
                column: "FinalizedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_FinalizedByUserId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_FinalizedByUserId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ClosureComment",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "FinalizedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "FinalizedByUserId",
                table: "Events");
        }
    }
}
