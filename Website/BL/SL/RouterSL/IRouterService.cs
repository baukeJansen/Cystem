using Website.Common.Viewmodels;

namespace Website.BL.SL.RouterSL
{
    public interface IRouterService : IService<GenericViewModel>
    {
        string GetTemplate(GenericViewModel vm);
    }
}
