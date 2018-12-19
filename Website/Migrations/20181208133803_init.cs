using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attributes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Label = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attributes", x => x.Id);
                });

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

            migrationBuilder.CreateTable(
                name: "Values",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AttributeId = table.Column<int>(nullable: false),
                    GroupId = table.Column<int>(nullable: true),
                    ValueId = table.Column<int>(nullable: true),
                    Discriminator = table.Column<string>(nullable: false),
                    TemplateId = table.Column<int>(nullable: true),
                    Int = table.Column<int>(nullable: true),
                    String = table.Column<string>(nullable: true),
                    StringValue_String = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Values", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Values_Attributes_AttributeId",
                        column: x => x.AttributeId,
                        principalTable: "Attributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Values_Values_ValueId",
                        column: x => x.ValueId,
                        principalTable: "Values",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Daily_Date",
                table: "Daily",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Values_String",
                table: "Values",
                column: "String");

            migrationBuilder.CreateIndex(
                name: "IX_Values_AttributeId",
                table: "Values",
                column: "AttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_Values_ValueId",
                table: "Values",
                column: "ValueId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Daily");

            migrationBuilder.DropTable(
                name: "Values");

            migrationBuilder.DropTable(
                name: "Attributes");
        }
    }
}
