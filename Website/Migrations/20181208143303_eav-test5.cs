using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class eavtest5 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_PageValueId",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "PageValueId",
                table: "Values",
                newName: "GroupValueId");

            migrationBuilder.RenameIndex(
                name: "IX_Values_PageValueId",
                table: "Values",
                newName: "IX_Values_GroupValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_GroupValueId",
                table: "Values",
                column: "GroupValueId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_GroupValueId",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "GroupValueId",
                table: "Values",
                newName: "PageValueId");

            migrationBuilder.RenameIndex(
                name: "IX_Values_GroupValueId",
                table: "Values",
                newName: "IX_Values_PageValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_PageValueId",
                table: "Values",
                column: "PageValueId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
