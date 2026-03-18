using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixEventAssignmentsRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignments_Events_EventId1",
                table: "Assignments");

            migrationBuilder.DropIndex(
                name: "IX_Assignments_EventId1",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "EventId1",
                table: "Assignments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EventId1",
                table: "Assignments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_EventId1",
                table: "Assignments",
                column: "EventId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignments_Events_EventId1",
                table: "Assignments",
                column: "EventId1",
                principalTable: "Events",
                principalColumn: "Id");
        }
    }
}
