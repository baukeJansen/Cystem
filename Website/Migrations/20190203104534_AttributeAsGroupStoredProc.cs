using Microsoft.EntityFrameworkCore.Migrations;
using Website.DAL;

namespace Website.Migrations
{
    public partial class AttributeAsGroupStoredProc : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            this.UpdateStoredProcs(migrationBuilder);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
