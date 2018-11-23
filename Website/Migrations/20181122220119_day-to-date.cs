using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class daytodate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyEggTotals");

            migrationBuilder.RenameColumn(
                name: "Day",
                table: "DeadChickens",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "Day",
                table: "DailyEggs",
                newName: "Date");

            migrationBuilder.CreateTable(
                name: "DailyTotals",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Date = table.Column<DateTime>(nullable: false),
                    EggCount = table.Column<int>(nullable: false),
                    ChickenCount = table.Column<int>(nullable: false),
                    Average = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyTotals", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyTotals_Date",
                table: "DailyTotals",
                column: "Date");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyTotals");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "DeadChickens",
                newName: "Day");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "DailyEggs",
                newName: "Day");

            migrationBuilder.CreateTable(
                name: "DailyEggTotals",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Average = table.Column<int>(nullable: false),
                    Date = table.Column<DateTime>(nullable: false),
                    EggCount = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyEggTotals", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyEggTotals_Date",
                table: "DailyEggTotals",
                column: "Date");
        }
    }
}
