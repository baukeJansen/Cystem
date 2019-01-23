using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
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
