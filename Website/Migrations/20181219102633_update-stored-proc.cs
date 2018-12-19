using Microsoft.EntityFrameworkCore.Migrations;

namespace Website.Migrations
{
    public partial class updatestoredproc : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sp = @"
                    ALTER PROCEDURE [dbo].[GetPage]
                        @url varchar(50)
                    AS
                    BEGIN
                        SET NOCOUNT ON;
	                    DROP TABLE IF EXISTS #Values;

	                    WITH CTE_VALUES AS (

		                    SELECT V1.Id, V1.Discriminator, V1.GroupId, V1.AttributeId, V1.Int, V1.String, V1.SerializedString
		                    FROM [Values] V1
		                    WHERE SerializedString = @url

		                    UNION ALL
		                    SELECT V.Id, V.Discriminator, V.GroupId, V.AttributeId, V.Int, V.String, V.SerializedString
		                    FROM CTE_VALUES C
			                    JOIN [Values] V
			                    ON C.Id = V.GroupId
	                    )
	                    SELECT *
	                    INTO #Values
	                    FROM CTE_VALUES

	                    SELECT Id, Discriminator, GroupId, AttributeId, Int, String, SerializedString 
	                    FROM #Values

	                    SELECT DISTINCT A.Id, A.Label
	                    FROM Attributes A
		                    JOIN #Values V
		                    ON V.AttributeId = A.Id

	                    DROP TABLE IF EXISTS #Values
                    END";

            migrationBuilder.Sql(sp);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var sp = @"ALTER PROCEDURE [dbo].[GetPage]
                    @url varchar(50)
                AS
                BEGIN
                    SET NOCOUNT ON;
                    Select * from [Values] where Url = @url
                END";

            migrationBuilder.Sql(sp);
        }
    }
}
