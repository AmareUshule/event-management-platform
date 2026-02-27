using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class SyncEventSchemaToDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_ApprovedBy",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_CreatedBy",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Departments_DepartmentId",
                table: "Events");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Events",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Events",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Events",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Events",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Events",
                newName: "start_date");

            migrationBuilder.RenameColumn(
                name: "EventPlace",
                table: "Events",
                newName: "event_place");

            migrationBuilder.RenameColumn(
                name: "EndDate",
                table: "Events",
                newName: "end_date");

            migrationBuilder.RenameColumn(
                name: "DepartmentId",
                table: "Events",
                newName: "department_id");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Events",
                newName: "created_by");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Events",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "ApprovedBy",
                table: "Events",
                newName: "approved_by");

            migrationBuilder.RenameColumn(
                name: "event_id",
                table: "Events",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_Events_DepartmentId",
                table: "Events",
                newName: "IX_Events_department_id");

            migrationBuilder.RenameIndex(
                name: "IX_Events_CreatedBy",
                table: "Events",
                newName: "IX_Events_created_by");

            migrationBuilder.RenameIndex(
                name: "IX_Events_ApprovedBy",
                table: "Events",
                newName: "IX_Events_approved_by");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "Events",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Events",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "event_place",
                table: "Events",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Events",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_approved_by",
                table: "Events",
                column: "approved_by",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_created_by",
                table: "Events",
                column: "created_by",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Departments_department_id",
                table: "Events",
                column: "department_id",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_approved_by",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_created_by",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Departments_department_id",
                table: "Events");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Events",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Events",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Events",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Events",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "start_date",
                table: "Events",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "event_place",
                table: "Events",
                newName: "EventPlace");

            migrationBuilder.RenameColumn(
                name: "end_date",
                table: "Events",
                newName: "EndDate");

            migrationBuilder.RenameColumn(
                name: "department_id",
                table: "Events",
                newName: "DepartmentId");

            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "Events",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Events",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "approved_by",
                table: "Events",
                newName: "ApprovedBy");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Events",
                newName: "event_id");

            migrationBuilder.RenameIndex(
                name: "IX_Events_department_id",
                table: "Events",
                newName: "IX_Events_DepartmentId");

            migrationBuilder.RenameIndex(
                name: "IX_Events_created_by",
                table: "Events",
                newName: "IX_Events_CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_Events_approved_by",
                table: "Events",
                newName: "IX_Events_ApprovedBy");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Events",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "now()");

            migrationBuilder.AlterColumn<string>(
                name: "EventPlace",
                table: "Events",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Events",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "now()");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_ApprovedBy",
                table: "Events",
                column: "ApprovedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_CreatedBy",
                table: "Events",
                column: "CreatedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Departments_DepartmentId",
                table: "Events",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
