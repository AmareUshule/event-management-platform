using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDateChangeNavigationProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DateChangeRequestStatus",
                table: "Events",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateChangeRequestedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DateChangeRequestedBy",
                table: "Events",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DateChangeReviewComment",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateChangeReviewedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DateChangeReviewedBy",
                table: "Events",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProposedEndDate",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProposedEventPlace",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProposedStartDate",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_DateChangeRequestedBy",
                table: "Events",
                column: "DateChangeRequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Events_DateChangeReviewedBy",
                table: "Events",
                column: "DateChangeReviewedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_DateChangeRequestedBy",
                table: "Events",
                column: "DateChangeRequestedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_DateChangeReviewedBy",
                table: "Events",
                column: "DateChangeReviewedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_DateChangeRequestedBy",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_DateChangeReviewedBy",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_DateChangeRequestedBy",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_DateChangeReviewedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DateChangeRequestStatus",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DateChangeRequestedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DateChangeRequestedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DateChangeReviewComment",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DateChangeReviewedAt",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DateChangeReviewedBy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ProposedEndDate",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ProposedEventPlace",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ProposedStartDate",
                table: "Events");
        }
    }
}
