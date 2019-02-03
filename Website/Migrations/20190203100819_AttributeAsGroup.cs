using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class AttributeAsGroup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Attributes_AttributeId",
                table: "Values");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Attributes",
                table: "Attributes");

            migrationBuilder.RenameTable(
                name: "Attributes",
                newName: "Groups");

            migrationBuilder.RenameColumn(
                "AttributeId", "Values", "GroupId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Groups",
                table: "Groups",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Groups_GroupId",
                table: "Values",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Values_Groups_GroupId",
                table: "Values");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Groups",
                table: "Groups");

            migrationBuilder.RenameTable(
                name: "Groups",
                newName: "Attributes");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Attributes",
                table: "Attributes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Values_Attributes_GroupId",
                table: "Values",
                column: "GroupId",
                principalTable: "Attributes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
