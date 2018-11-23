using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class standarisedeggtypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SecondKindEggs",
                table: "LayingPercentage");

            migrationBuilder.AddColumn<int>(
                name: "ExportType",
                table: "LayingPercentage",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExportType",
                table: "LayingPercentage");

            migrationBuilder.AddColumn<int>(
                name: "SecondKindEggs",
                table: "LayingPercentage",
                nullable: false,
                defaultValue: 0);
        }
    }
}
