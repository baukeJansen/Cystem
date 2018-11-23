using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class addlayingpercentage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pages_Template_TemplateId",
                table: "Pages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Template",
                table: "Template");

            migrationBuilder.RenameTable(
                name: "Template",
                newName: "Templates");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Templates",
                table: "Templates",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "LayingPercentage",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Day = table.Column<DateTime>(nullable: false),
                    Eggs = table.Column<int>(nullable: false),
                    SecondKindEggs = table.Column<int>(nullable: false),
                    EmptyAfterRun = table.Column<bool>(nullable: false),
                    Remarks = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LayingPercentage", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Pages_Templates_TemplateId",
                table: "Pages",
                column: "TemplateId",
                principalTable: "Templates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pages_Templates_TemplateId",
                table: "Pages");

            migrationBuilder.DropTable(
                name: "LayingPercentage");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Templates",
                table: "Templates");

            migrationBuilder.RenameTable(
                name: "Templates",
                newName: "Template");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Template",
                table: "Template",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pages_Template_TemplateId",
                table: "Pages",
                column: "TemplateId",
                principalTable: "Template",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
