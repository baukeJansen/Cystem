using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class eavtest4 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Daily_Date",
                table: "Daily");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Daily_Date",
                table: "Daily",
                column: "Date");
        }
    }
}
