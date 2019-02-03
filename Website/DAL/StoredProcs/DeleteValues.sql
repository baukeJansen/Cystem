ALTER PROCEDURE [dbo].[DeleteValues]
	@id int,
	@preview bit = true
AS
BEGIN
	DROP TABLE IF EXISTS #Values;

	WITH CTE_VALUES AS (

		SELECT CAST(1 AS INT) AS Recursion, V1.Id, V1.ParentId
		FROM [Values] V1
		WHERE Id = @id

		UNION ALL
		SELECT C.Recursion + 1, V.Id, V.ParentId
		FROM CTE_VALUES C
			JOIN [Values] V
			ON C.Id = V.ParentId
	)
	SELECT ROW_NUMBER() OVER (ORDER BY Recursion DESC) Ord, ParentId
	INTO #Values
	FROM CTE_VALUES
	GROUP BY Recursion, ParentId

	DECLARE @current INT = 1, @max INT = @@ROWCOUNT - 1;

	IF (@preview = 'True')
	BEGIN
		DROP TABLE IF EXISTS #Results

		SELECT 1 as [order], * INTO #Results FROM [Values] V WHERE Id = @id
		UNION ALL
		--Adding a union removes the identity from the id column. Without this the insert into will give an error
		SELECT 1, * FROM [Values] IdentityFix WHERE 0 = 1

		WHILE @current <= @max
		BEGIN
			INSERT INTO #Results
			SELECT 2, *
			FROM [Values] V
			WHERE ParentId = (SELECT ParentId FROM #Values WHERE Ord = @current);
			SET @current = @current + 1;
		END;

		SELECT Id, GroupId, ParentId, Int, String, SerializedString, Type FROM #Results
		ORDER BY [order]

		SELECT DISTINCT A.Id, A.Type, A.Label
		FROM Groups A
			JOIN #Results R
			ON R.GroupId = A.Id

		DROP TABLE IF EXISTS #Results
	END

	ELSE
	BEGIN
		WHILE @current <= @max
		BEGIN
			DELETE FROM [Values] WHERE ParentId = (SELECT ParentId FROM #Values WHERE Ord = @current);
			SET @current = @current + 1;
		END;

		DELETE FROM [Values] WHERE Id = @id;
	END

	DROP TABLE IF EXISTS #Values
END