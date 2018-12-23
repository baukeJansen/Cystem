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

/*
 * USE [Website]
GO
****** Object:  StoredProcedure [dbo].[GetPage]    Script Date: 23-12-2018 12:14:46 ******
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE[dbo].[GetPage]
@url varchar(50),
	@recursionDepth int = 100,
	@relatedDepth int = 1,
	@relatedRecursionDepth int = 1
AS
BEGIN
    SET NOCOUNT ON;
	DROP TABLE IF EXISTS #Values;


    WITH CTE_VALUES AS(

        SELECT 1 AS Recursion, 1 AS Related, V1.Id, V1.Discriminator, V1.GroupId, V1.AttributeId, V1.Int, V1.String, V1.SerializedString
        FROM [Values] V1
        WHERE SerializedString = @url


        UNION ALL

        SELECT C.Recursion + 1, C.Related, V.Id, V.Discriminator, V.GroupId, V.AttributeId, V.Int, V.String, V.SerializedString
        FROM CTE_VALUES C

            JOIN[Values] V

            ON C.Id = V.GroupId

        WHERE C.Recursion <= @recursionDepth
        AND (C.Recursion <= @relatedRecursionDepth OR C.Related = 1)


        UNION ALL

        SELECT 1, C.Related + 1, V.Id, V.Discriminator, V.GroupId, V.AttributeId, V.Int, V.String, V.SerializedString
        FROM[Values] V
           JOIN CTE_VALUES C

            ON V.Id = C.Int
        WHERE C.Related <= @relatedDepth
        AND C.Discriminator = 'RelatedValue'
    )

    SELECT DISTINCT Recursion, Related, Id, Discriminator, GroupId, AttributeId, Int, String, SerializedString
    INTO #Values
	FROM CTE_VALUES

    ORDER BY Recursion, Related

    SELECT Id, Discriminator, GroupId, AttributeId, Int, String, SerializedString
    FROM #Values


    SELECT DISTINCT A.Id, A.Label
    FROM Attributes A

        JOIN #Values V
		ON V.AttributeId = A.Id

    DROP TABLE IF EXISTS #Values
END
 */