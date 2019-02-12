using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class nullabledatetime : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "Time",
                table: "Values",
                nullable: true,
                oldClrType: typeof(DateTime));

            migrationBuilder.RenameColumn("Time", "Values", "DateTime");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn("DateTime", "Values", "Time");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Time",
                table: "Values",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldNullable: true);
        }
    }
}
