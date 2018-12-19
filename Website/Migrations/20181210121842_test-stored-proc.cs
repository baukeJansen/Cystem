using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class teststoredproc : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sp = @"CREATE PROCEDURE [dbo].[GetPage]
                    @url varchar(50)
                AS
                BEGIN
                    SET NOCOUNT ON;
                    Select * from [Values] where Url = @url
                END";

            migrationBuilder.Sql(sp);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
