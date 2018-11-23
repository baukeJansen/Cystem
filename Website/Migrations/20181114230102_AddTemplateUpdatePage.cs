using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class AddTemplateUpdatePage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "Pages",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Template",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Template", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pages_TemplateId",
                table: "Pages",
                column: "TemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pages_Template_TemplateId",
                table: "Pages",
                column: "TemplateId",
                principalTable: "Template",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pages_Template_TemplateId",
                table: "Pages");

            migrationBuilder.DropTable(
                name: "Template");

            migrationBuilder.DropIndex(
                name: "IX_Pages_TemplateId",
                table: "Pages");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "Pages");
        }
    }
}
