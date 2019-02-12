ALTER PROCEDURE [dbo].[GetValues]
	@id int,
    @url varchar(50),
	@recursionDepth int = 100,
	@relatedDepth int = 1,
	@relatedRecursionDepth int = 1,
	@param int = 0
AS
BEGIN
    SET NOCOUNT ON;
	DROP TABLE IF EXISTS #Values;

	WITH CTE_VALUES AS (

		SELECT CAST(1 AS INT) AS Recursion, CAST(1 AS INT) AS Related, V1.Id, V1.Type, V1.ParentId, V1.GroupId, V1.Int, V1.String, V1.SerializedString, V1.DateTime, V1.[Order]
		FROM [Values] V1
		WHERE Id = @id
		OR SerializedString = @url

		UNION ALL
		SELECT C.Recursion + 1, C.Related, V.Id, V.Type, V.ParentId, V.GroupId, V.Int, V.String, V.SerializedString, V.DateTime, V.[Order]
		FROM CTE_VALUES C
			JOIN [Values] V
			ON C.Id = V.ParentId
		WHERE C.Recursion <= @recursionDepth
		AND (C.Recursion <= @relatedRecursionDepth OR C.Related = 1)

		UNION ALL
		SELECT 1, C.Related + 1, V.Id, V.Type, V.ParentId, V.GroupId, V.Int, V.String, V.SerializedString, V.DateTime, V.[Order]
		FROM [Values] V
			JOIN CTE_VALUES C
			ON V.Id = C.Int
		WHERE C.Related <= @relatedDepth
		AND C.Type = 4

		UNION ALL
		SELECT 1, C.Related + 1, V.Id, V.Type, V.ParentId, V.GroupId, V.Int, V.String, V.SerializedString, V.DateTime, V.[Order]
		FROM [Values] V
			JOIN CTE_VALUES C
			ON V.Id = @param
		WHERE C.Related <= 1
		AND C.Type = 7
	)
	SELECT Recursion, Related, Id, Type, ParentId, GroupId, Int, String, SerializedString, DateTime, [Order]
	INTO #Values
	FROM CTE_VALUES

	-- Distinct, order by recursion, related
	SELECT V.Id, V.Type, V.ParentId, V.GroupId, V.Int, V.String, V.SerializedString , V.DateTime, V.[Order]
	FROM (
		SELECT Distinct DistinctValues.Rec, DistinctValues.Rel, V.Id, V.Type, V.ParentId, V.GroupId, V.Int, V.String, V.SerializedString, V.DateTime, V.[Order]
		FROM #Values V
		INNER JOIN(
			SELECT Id, MIN(Recursion) Rec, MIN(Related) Rel
			FROM #Values
			GROUP BY Id
		) DistinctValues
		ON V.Id = DistinctValues.Id
	) as V
	ORDER BY V.Rec, V.Rel

	SELECT DISTINCT A.Id, A.Type, A.Label
	FROM Groups A
		JOIN #Values V
		ON V.GroupId = A.Id

	UNION ALL
	SELECT DISTINCT A.Id, A.Type, A.Label
	FROM Groups A 
		JOIN #Values R
		On R.Int = A.Id
	WHERE R.Type = 6

	DROP TABLE IF EXISTS #Values
END