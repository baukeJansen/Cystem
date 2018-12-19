using System.Threading.Tasks;
using Website.Common.Models.EAV;

namespace Website.BL.LL.PageLL
{
    public interface IPageLogic
    {
        //PageValue Get(string url);
        Task<PageValue> Get(string url);
    }
}
