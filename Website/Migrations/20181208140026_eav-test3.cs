using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class eavtest3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Values_String",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "PageValue_Int",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "StringValue_String",
                table: "Values",
                newName: "Url");

            migrationBuilder.AlterColumn<string>(
                name: "String",
                table: "Values",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Url",
                table: "Values",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PageValueId",
                table: "Values",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TemplateValueId",
                table: "Values",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Values_Url",
                table: "Values",
                column: "Url");

            migrationBuilder.CreateIndex(
                name: "IX_Values_PageValueId",
                table: "Values",
                column: "PageValueId");

            migrationBuilder.CreateIndex(
                name: "IX_Values_TemplateValueId",
                table: "Values",
                column: "TemplateValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Values_PageValueId",
                table: "Values",
                column: "PageValueId",
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_PageValueId",
                table: "Values");

            migrationBuilder.DropForeignKey(
                name: "FK_Values_Values_TemplateValueId",
                table: "Values");

            migrationBuilder.DropIndex(
                name: "IX_Values_Url",
                table: "Values");

            migrationBuilder.DropIndex(
                name: "IX_Values_PageValueId",
                table: "Values");

            migrationBuilder.DropIndex(
                name: "IX_Values_TemplateValueId",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "PageValueId",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "TemplateValueId",
                table: "Values");

            migrationBuilder.RenameColumn(
                name: "Url",
                table: "Values",
                newName: "StringValue_String");

            migrationBuilder.AlterColumn<string>(
                name: "String",
                table: "Values",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StringValue_String",
                table: "Values",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PageValue_Int",
                table: "Values",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Values_String",
                table: "Values",
                column: "String");
        }
    }
}
