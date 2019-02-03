using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Website.Common.Viewmodels;
using Website.Views.HtmlHelpers;

namespace Website.ViewComponents
{
    public class RenderViewComponent : BaseViewComponent
    {
        public RenderViewComponent(IValueHelper valueHelper) : base(valueHelper)
        {
            
        }

        public Task<IViewComponentResult> InvokeAsync(GenericViewModel vm)
        {
            if (vm == null || vm.Value == null) return Task.FromResult((IViewComponentResult)Content(""));

            string viewLocation = GetViewLocation(vm);
            return Task.FromResult((IViewComponentResult)View(viewLocation, vm));
        }

        //IViewComponentResult result = await Render(value, options);
        //await result.ExecuteAsync(ViewComponentContext);
    }
}
