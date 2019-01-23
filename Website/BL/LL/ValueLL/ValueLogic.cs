using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.BL.QL.ValueQL;
using Website.Common.Data;
using Website.Common.Models.EAV;
using Website.DAL;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.BL.LL.ValueLL
{
    public class ValueLogic : Logic, IValueLogic
    {
        private readonly DataContext context;
        private readonly IValueQuery valueQuery;

        public ValueLogic(DataContext context, IValueQuery valueQuery)
        {
            this.context = context;
            this.valueQuery = valueQuery;
        }

        public async Task<Value> Get(int id, int param = 0)
        {
            QueryResult result = await valueQuery.GetValues(id);
            return SortValues(result, param);
        }

        public async Task<Value> Get(string url, int param = 0)
        {
            QueryResult result = await valueQuery.GetValues(url, param);
            return SortValues(result, param);
        }

        public void Store(Value value)
        {
            if (value.Id == 0)
            {
                context.Values.Add(value);
            }
            else
            {
                context.Values.Update(value);
            }
        }

        public void Store(List<Value> values)
        {
            List<Value> add = values.Where(v => v.Id == 0).ToList();
            List<Value> update = values.Where(v => v.Id != 0).ToList();

            context.Values.AddRange(add);
            context.Values.UpdateRange(update);
        }

        public void StoreRelated(List<Value> values)
        {
            List<Value> relatedValues = GetRelatedValues(values);

            foreach(Value value in relatedValues)
            {
                values.Add(value.RelatedValue);
            }

            Store(values);

            if (relatedValues.Count > 0)
            {
                context.SaveChanges();

                foreach (Value value in relatedValues)
                {
                    value.Int = value.RelatedValue.Id;
                }
            }
        }

        private List<Value> GetRelatedValues(List<Value> values)
        {
            List<Value> relatedValues = new List<Value>();

            foreach(Value value in values)
            {
                if (value.Type == ValueType.RelatedValue)
                {
                    if ( value.RelatedValue != null && value.Int == null)
                    {
                        relatedValues.Add(value);
                        relatedValues.AddRange(GetRelatedValues(new List<Value> { value.RelatedValue }));
                    }
                }

                if (value.Values != null)
                {
                    relatedValues.AddRange(GetRelatedValues(value.Values));
                }
            }

            return relatedValues;
        }

        public async Task<Value> PreviewDelete(Value value)
        {
            QueryResult result = await valueQuery.PreviewDeleteCascade(value.Id);
            return SortValues(result);
        }

        public async Task Delete(Value value)
        {
            await valueQuery.DeleteValueCascade(value.Id);
        }

        public async Task Delete(List<Value> values)
        {
            context.Values.RemoveRange(values);
        }

        public Value SortValues(QueryResult result, int param = 0)
        {
            foreach (Value value in result.Values)
            {
                value.Attribute = result.Attributes.Find(a => a.Id == value.AttributeId);

                if (value.GroupId.HasValue)
                {
                    Value group = result.Values.Find(v => v.Id == value.GroupId);

                    if (group != null)
                    {
                        value.Group = group;
                        if (group.Values == null) group.Values = new List<Value>();
                        group.Values.Add(value);
                    }
                }

                if (value.Type == ValueType.RelatedValue)
                {
                    value.RelatedValue = result.Values.Find(v => v.Id == value.Int);
                }

                if (value.Type == ValueType.RelatedAttribute)
                {
                    value.RelatedAttribute = result.Attributes.Find(a => a.Id == value.Int);
                }

                if (value.Type == ValueType.ParamValue)
                {
                    value.RelatedValue = result.Values.Find(v => v.Id == param);
                }
            }

            return result.Values.FirstOrDefault();
        }
    }
}
