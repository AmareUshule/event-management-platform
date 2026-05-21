using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEventCancellationRequestFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancellationRequestStatus",
                table: "Events",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.AddColumn<DateTime>(
                name: "CancellationRequestedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CancellationRequestedBy",
                table: "Events",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReviewComment",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancellationReviewedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CancellationReviewedBy",
                table: "Events",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_CancellationRequestedBy",
                table: "Events",
                column: "CancellationRequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Events_CancellationReviewedBy",
                table: "Events",
                column: "CancellationReviewedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_CancellationRequestedBy",
                table: "Events",
                column: "CancellationRequestedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_CancellationReviewedBy",
                table: "Events",
                column: "CancellationReviewedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_CancellationRequestedBy",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_CancellationReviewedBy",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_CancellationRequestedBy",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_CancellationReviewedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CancellationRequestStatus",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CancellationRequestedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CancellationRequestedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CancellationReviewComment",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CancellationReviewedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CancellationReviewedBy",
                table: "Events");
        }
    }
}
