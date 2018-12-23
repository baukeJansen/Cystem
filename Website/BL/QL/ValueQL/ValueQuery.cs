using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV;
using Website.DAL;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.BL.QL.ValueQL
{
    public class ValueQuery : Query, IValueQuery
    {
        public ValueQuery(DataContext context) : base(context) { }

        public async Task<Value> GetValues(DbCommand command)
        {
            List<Value> values = new List<Value>();
            List<Attribute> attributes = new List<Attribute>();

            command.Connection = context.Database.GetDbConnection();

            await context.Database.OpenConnectionAsync();
            using (SqlDataReader reader = (SqlDataReader)await command.ExecuteReaderAsync(CommandBehavior.CloseConnection)){

                while (reader.HasRows && await reader.ReadAsync())
                {
                    Value value;
                    string discriminator = reader.GetString(1);
                    switch (discriminator)
                    {
                        case "PageValue": value = new PageValue(); break;
                        case "TemplateValue": value = new TemplateValue(); break;
                        case "GroupValue": value = new GroupValue(); break;
                        case "RelatedValue": value = new RelatedValue(); break;
                        case "StringValue": value = new StringValue(); break;
                        case "IntValue": value = new IntValue(); break;
                        default: throw new Exception("Invalid discriminator");
                    }

                    reader.MapDataToObject(value);
                    values.Add(value);
                }

                if (await reader.NextResultAsync())
                {
                    while (reader.HasRows && await reader.ReadAsync())
                    {
                        Attribute attribute = new Attribute();
                        reader.MapDataToObject(attribute);
                        attributes.Add(attribute);
                    }
                }
            }

            if (values.Count == 0) return null;
            return SortValues(values, attributes);
        }

        public Value SortValues(List<Value> values, List<Attribute> attributes)
        {
            foreach (Value value in values)
            {
                value.Attribute = attributes.Find(a => a.Id == value.AttributeId);

                if (value.GroupId.HasValue)
                {
                    GroupValue group = (GroupValue) values.Find(v => v.Id == value.GroupId);

                    if (group != null)
                    {
                        value.Group = group;
                        if (group.Values == null) group.Values = new List<Value>();
                        group.Values.Add(value);
                    }
                }

                if (value.GetType() == typeof(RelatedValue))
                {
                    RelatedValue related = (RelatedValue)value;
                    related.Related = values.Find(v => v.Id == related.RelatedId);
                }
            }

            return values.First();
        }
    }
}
