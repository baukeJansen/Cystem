using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class eavtest2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TemplateValue_Int",
                table: "Values");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TemplateValue_Int",
                table: "Values",
                nullable: true);
        }
    }
}
