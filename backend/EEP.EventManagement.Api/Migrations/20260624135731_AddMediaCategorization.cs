using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EEP.EventManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaCategorization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MediaSubCategoryId",
                table: "MediaFiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MediaCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MediaSubCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    MediaCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaSubCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MediaSubCategories_MediaCategories_MediaCategoryId",
                        column: x => x.MediaCategoryId,
                        principalTable: "MediaCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MediaFiles_MediaSubCategoryId",
                table: "MediaFiles",
                column: "MediaSubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaSubCategories_MediaCategoryId",
                table: "MediaSubCategories",
                column: "MediaCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_MediaFiles_MediaSubCategories_MediaSubCategoryId",
                table: "MediaFiles",
                column: "MediaSubCategoryId",
                principalTable: "MediaSubCategories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MediaFiles_MediaSubCategories_MediaSubCategoryId",
                table: "MediaFiles");

            migrationBuilder.DropTable(
                name: "MediaSubCategories");

            migrationBuilder.DropTable(
                name: "MediaCategories");

            migrationBuilder.DropIndex(
                name: "IX_MediaFiles_MediaSubCategoryId",
                table: "MediaFiles");

            migrationBuilder.DropColumn(
                name: "MediaSubCategoryId",
                table: "MediaFiles");
        }
    }
}
