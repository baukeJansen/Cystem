using System.Threading.Tasks;
using Website.Common.Models.EAV;

namespace Website.BL.LL.PageLL
{
    public interface IPageLogic
    {
        //PageValue Get(string url);
        Task<Value> Get(string url, int param = 0);
    }
}
