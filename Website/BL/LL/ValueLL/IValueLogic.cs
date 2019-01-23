using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Common.Models.EAV;

namespace Website.BL.LL.ValueLL
{
    public interface IValueLogic
    {
        Task<Value> Get(int id, int param = 0);
        Task<Value> Get(string url, int param = 0);
        void Store(Value value);
        void Store(List<Value> values);
        void StoreRelated(List<Value> values);
        Task<Value> PreviewDelete(Value value);
        Task Delete(Value value);
        Task Delete(List<Value> values);
    }
}
