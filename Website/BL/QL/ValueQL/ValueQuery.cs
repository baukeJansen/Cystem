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
using Website.Common.Enums;
using Attribute = Website.Common.Models.EAV.Attribute;
using ValueType = Website.Common.Enums.ValueType;

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
                    Value value = new Value();
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

            int param = 0;
            if (command.Parameters.Contains("@paramPAR"))
            {
                param = (int)command.Parameters["@paramPAR"].Value;
            }

            return SortValues(values, attributes, param);
        }

        public Value SortValues(List<Value> values, List<Attribute> attributes, int param = 0)
        {
            foreach (Value value in values)
            {
                value.Attribute = attributes.Find(a => a.Id == value.AttributeId);

                if (value.GroupId.HasValue)
                {
                    Value group = values.Find(v => v.Id == value.GroupId);

                    if (group != null)
                    {
                        value.Group = group;
                        if (group.Values == null) group.Values = new List<Value>();
                        group.Values.Add(value);
                    }
                }

                if (value.Type == ValueType.RelatedValue)
                {
                    value.RelatedValue = values.Find(v => v.Id == value.Int);
                }

                if (value.Type == ValueType.RelatedAttribute)
                {
                    value.RelatedAttribute = attributes.Find(a => a.Id == value.Int);
                }

                if (value.Type == ValueType.ParamValue)
                {
                    value.RelatedValue = values.Find(v => v.Id == param);
                }
            }

            return values.First();
        }
    }
}
