using Website.Common.Models;

namespace Website.BL.LL.PageLL
{
    public interface IPageLogic
    {
        Page Get(int id);
        Page Get(string url);
    }
}
