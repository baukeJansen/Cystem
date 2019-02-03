using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class extendValue : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_GroupId",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "GroupId",
                table: "Values",
                newName: "ParentId");

            migrationBuilder.RenameIndex(
                name: "IX_Values_GroupId",
                table: "Values",
                newName: "IX_Values_ParentId");

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Values",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Permission",
                table: "Values",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "Time",
                table: "Values",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_ParentId",
                table: "Values",
                column: "ParentId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_ParentId",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "Permission",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "Time",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "ParentId",
                table: "Values",
                newName: "GroupId");

            migrationBuilder.RenameIndex(
                name: "IX_Values_ParentId",
                table: "Values",
                newName: "IX_Values_GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_GroupId",
                table: "Values",
                column: "GroupId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
