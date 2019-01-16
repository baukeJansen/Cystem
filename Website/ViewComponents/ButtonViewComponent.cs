using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Website.Common.Data;
using Website.Views.HtmlHelpers;

namespace Website.ViewComponents
{
    public class ButtonViewComponent : BaseViewComponent
    {
        public ButtonViewComponent(IValueHelper valueHelper) : base(valueHelper) { }

        public async Task<IViewComponentResult> InvokeAsync(ButtonData data)
        {
            string viewLocation = TemplateLocation + RenderPath + "button" + FileType;
            return View(viewLocation, data);
        }
    }
}
