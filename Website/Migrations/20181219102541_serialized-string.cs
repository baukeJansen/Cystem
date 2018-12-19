using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class serializedstring : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Url",
                table: "Values",
                newName: "SerializedString");

            migrationBuilder.RenameIndex(
                name: "IX_Values_Url",
                table: "Values",
                newName: "IX_Values_SerializedString");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SerializedString",
                table: "Values",
                newName: "Url");

            migrationBuilder.RenameIndex(
                name: "IX_Values_SerializedString",
                table: "Values",
                newName: "IX_Values_Url");
        }
    }
}
