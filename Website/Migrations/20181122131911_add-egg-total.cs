using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class addeggtotal : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_LayingPercentage",
                table: "LayingPercentage");

            migrationBuilder.RenameTable(
                name: "LayingPercentage",
                newName: "DailyEggs");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DailyEggs",
                table: "DailyEggs",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "DailyEggTotals",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Date = table.Column<DateTime>(nullable: false),
                    EggCount = table.Column<int>(nullable: false),
                    Average = table.Column<int>(nullable: false)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyEggTotals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DailyEggs",
                table: "DailyEggs");

            migrationBuilder.RenameTable(
                name: "DailyEggs",
                newName: "LayingPercentage");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LayingPercentage",
                table: "LayingPercentage",
                column: "Id");
        }
    }
}
