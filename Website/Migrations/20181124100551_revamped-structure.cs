using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class revampedstructure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyEggs");

            migrationBuilder.DropTable(
                name: "DeadChickens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DailyTotals",
                table: "DailyTotals");

            migrationBuilder.RenameTable(
                name: "DailyTotals",
                newName: "Daily");

            migrationBuilder.RenameColumn(
                name: "EggCount",
                table: "Daily",
                newName: "TotalEggs");

            migrationBuilder.RenameColumn(
                name: "ChickenCount",
                table: "Daily",
                newName: "TotalChickens");

            migrationBuilder.RenameColumn(
                name: "Average",
                table: "Daily",
                newName: "SecondKindEggs");

            migrationBuilder.RenameIndex(
                name: "IX_DailyTotals_Date",
                table: "Daily",
                newName: "IX_Daily_Date");

            migrationBuilder.AddColumn<int>(
                name: "AverageEggs",
                table: "Daily",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DeadChickens",
                table: "Daily",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NormalEggs",
                table: "Daily",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OtherEggs",
                table: "Daily",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SaleEggs",
                table: "Daily",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Daily",
                table: "Daily",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "LayingPercentages",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    StartDate = table.Column<DateTime>(nullable: false),
                    EndDate = table.Column<DateTime>(nullable: false),
                    Percentage = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LayingPercentages", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LayingPercentages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Daily",
                table: "Daily");

            migrationBuilder.DropColumn(
                name: "AverageEggs",
                table: "Daily");

            migrationBuilder.DropColumn(
                name: "DeadChickens",
                table: "Daily");

            migrationBuilder.DropColumn(
                name: "NormalEggs",
                table: "Daily");

            migrationBuilder.DropColumn(
                name: "OtherEggs",
                table: "Daily");

            migrationBuilder.DropColumn(
                name: "SaleEggs",
                table: "Daily");

            migrationBuilder.RenameTable(
                name: "Daily",
                newName: "DailyTotals");

            migrationBuilder.RenameColumn(
                name: "TotalEggs",
                table: "DailyTotals",
                newName: "EggCount");

            migrationBuilder.RenameColumn(
                name: "TotalChickens",
                table: "DailyTotals",
                newName: "ChickenCount");

            migrationBuilder.RenameColumn(
                name: "SecondKindEggs",
                table: "DailyTotals",
                newName: "Average");

            migrationBuilder.RenameIndex(
                name: "IX_Daily_Date",
                table: "DailyTotals",
                newName: "IX_DailyTotals_Date");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DailyTotals",
                table: "DailyTotals",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "DailyEggs",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Date = table.Column<DateTime>(nullable: false),
                    Eggs = table.Column<int>(nullable: false),
                    EmptyAfterRun = table.Column<bool>(nullable: false),
                    ExportType = table.Column<int>(nullable: false),
                    Remarks = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyEggs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DeadChickens",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<int>(nullable: false),
                    Date = table.Column<DateTime>(nullable: false),
                    Remarks = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeadChickens", x => x.Id);
                });
        }
    }
}
