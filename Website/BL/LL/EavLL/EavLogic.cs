using System.Collections.Generic;
using System.Linq;
using Website.Common.Models.EAV;
using Website.DAL;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.BL.LL.EavLL
{
    public class EavLogic : Logic, IEavLogic
    {
        private readonly DataContext context;

        public EavLogic(DataContext context)
        {
            this.context = context;
        }

        public Value Get(int id)
        {
            return context.Values.Find(id);
        }

        public List<Value> GetForId(int id)
        {
            return context.Values.Where(v => v.Id == id).ToList();
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

        public void Delete(Value value)
        {
            context.Values.Remove(value);
        }

        public void Delete(List<Value> values)
        {
            context.Values.RemoveRange(values);
        }
    }
}
