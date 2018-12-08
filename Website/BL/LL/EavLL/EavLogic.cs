using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.Common.Models.EAV;
using Website.DAL;

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

        public List<Value> GetForEntity(Entity entity)
        {
            return GetForEntity(entity.Id);
        }

        public List<Value> GetForEntity(int id)
        {
            return context.Values.Where(v => v.EntityId == id).ToList();
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
            throw new NotImplementedException();
        }

        public void Delete(Value value)
        {
            context.Values.Remove((StringValue)value);
        }

        public void Delete(List<Value> values)
        {
            context.Values.RemoveRange(values);
        }
    }
}
