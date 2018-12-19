using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.Common.Models.EAV;

namespace Website.BL.LL.EavLL
{
    public interface IEavLogic
    {
        Value Get(int id);
        List<Value> GetForId(int id);
        void Store(Value value);
        void Store(List<Value> values);
        void Delete(Value value);
        void Delete(List<Value> values);
    }
}
