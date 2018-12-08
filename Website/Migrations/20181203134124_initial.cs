using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Daily",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Date = table.Column<DateTime>(nullable: false),
                    NormalEggs = table.Column<int>(nullable: false),
                    SecondKindEggs = table.Column<int>(nullable: false),
                    SaleEggs = table.Column<int>(nullable: false),
                    OtherEggs = table.Column<int>(nullable: false),
                    TotalEggs = table.Column<int>(nullable: false),
                    AverageEggs = table.Column<int>(nullable: false),
                    TotalChickens = table.Column<int>(nullable: false),
                    DeadChickens = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Daily", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Daily_Date",
                table: "Daily",
                column: "Date");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Daily");
        }
    }
}
