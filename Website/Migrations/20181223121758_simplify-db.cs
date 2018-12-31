using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class simplifydb : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "Values");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Values",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Values");

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "Values",
                nullable: false,
                defaultValue: "");
        }
    }
}
