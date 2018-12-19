using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class eavtest6 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_GroupValueId",
                table: "Values");

            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_TemplateValueId",
                table: "Values");

            migrationBuilder.DropIndex(
                name: "IX_Values_GroupValueId",
                table: "Values");

            migrationBuilder.DropIndex(
                name: "IX_Values_TemplateValueId",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "GroupValueId",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "TemplateValueId",
                table: "Values");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GroupValueId",
                table: "Values",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TemplateValueId",
                table: "Values",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Values_GroupValueId",
                table: "Values",
                column: "GroupValueId");

            migrationBuilder.CreateIndex(
                name: "IX_Values_TemplateValueId",
                table: "Values",
                column: "TemplateValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_GroupValueId",
                table: "Values",
                column: "GroupValueId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_TemplateValueId",
                table: "Values",
                column: "TemplateValueId",
                principalTable: "Values",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
