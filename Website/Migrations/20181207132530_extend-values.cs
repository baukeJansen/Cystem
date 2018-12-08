using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class extendvalues : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IntVal",
                table: "Values",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StringVal",
                table: "Values",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "Values",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IntVal",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "StringVal",
                table: "Values");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "Values");
        }
    }
}
