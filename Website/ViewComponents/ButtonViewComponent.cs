using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Website.Common.Data;
using Website.Views.HtmlHelpers;

namespace Website.ViewComponents
{
    public class ButtonViewComponent : BaseViewComponent
    {
        public ButtonViewComponent(IValueHelper valueHelper) : base(valueHelper) { }

        public Task<IViewComponentResult> InvokeAsync(ButtonData data)
        {
            string viewLocation;

            if (data.Link)
            {
                viewLocation = TemplateLocation + RenderPath + "link" + FileType;
            }
            else
            {
                viewLocation = TemplateLocation + RenderPath + "button" + FileType;
            }

            return Task.FromResult((IViewComponentResult)View(viewLocation, data));
        }
    }
}
