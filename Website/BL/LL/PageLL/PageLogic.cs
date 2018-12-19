using FastMember;
using System;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Website.BL.QL.ValueQL;
using Website.Common.Models.EAV;
using Website.DAL;


namespace Website.BL.LL.PageLL
{
    public class PageLogic : Logic, IPageLogic
    {
        private readonly DataContext context;
        private readonly IValueQuery valueQuery;

        public PageLogic(DataContext context, IValueQuery valueQuery)
        {
            this.context = context;
            this.valueQuery = valueQuery;
        }

        public async Task<PageValue> Get(string url)
        {
            Value value;

            //using (DbCommand command = context.Database.GetDbConnection().CreateCommand())
            using (SqlCommand command = new SqlCommand()) {
                SqlParameter param = new SqlParameter("@url", url);

                command.CommandText = "GetPage @url";
                command.Parameters.Add(param);

                value = await valueQuery.GetValues(command);
            }

            return (PageValue)value;
        }
    }
}

public static class extension
{
    /// <summary>
    /// Maps a SqlDataReader record to an object.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="dataReader"></param>
    /// <param name="newObject"></param>
    public static void MapDataToObject<T>(this SqlDataReader dataReader, T newObject)
    {
        if (newObject == null) throw new ArgumentNullException(nameof(newObject));

        // Fast Member Usage
        var objectMemberAccessor = TypeAccessor.Create(newObject.GetType());
        var propertiesHashSet =
                objectMemberAccessor
                .GetMembers()
                .Select(mp => mp.Name)
                .ToHashSet();

        for (int i = 0; i < dataReader.FieldCount; i++)
        {
            if (propertiesHashSet.Contains(dataReader.GetName(i)))
            {
                objectMemberAccessor[newObject, dataReader.GetName(i)]
                    = dataReader.IsDBNull(i) ? null : dataReader.GetValue(i);
            }
        }
    }
}