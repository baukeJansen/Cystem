using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class eavtest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_ValueId",
                table: "Values");

            migrationBuilder.DropIndex(
                name: "IX_Values_ValueId",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "ValueId",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "TemplateId",
                table: "Values",
                newName: "TemplateValue_Int");

            migrationBuilder.AddColumn<int>(
                name: "PageValue_Int",
                table: "Values",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Values_GroupId",
                table: "Values",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_GroupId",
                table: "Values",
                column: "GroupId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_GroupId",
                table: "Values");

            migrationBuilder.DropIndex(
                name: "IX_Values_GroupId",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "PageValue_Int",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "TemplateValue_Int",
                table: "Values",
                newName: "TemplateId");

            migrationBuilder.AddColumn<int>(
                name: "ValueId",
                table: "Values",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Values_ValueId",
                table: "Values",
                column: "ValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_ValueId",
                table: "Values",
                column: "ValueId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
