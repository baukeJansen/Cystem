using Microsoft.EntityFrameworkCore.Migrations;
using Website.DAL;

namespace Website.Migrations
{
    public partial class updatestoredprocs : Migration
    {
        private const string MIGRATION_SQL_SCRIPT_FILE_NAME = @"Migrations\Scripts\20170710123314_AddSomethingMigration.sql";

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            this.UpdateStoredProcs(migrationBuilder);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
