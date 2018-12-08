using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Website.Common.Viewmodels;

namespace Website.Controllers.ViewComponents
{
    public class CystemCommonHeader : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(ActionViewModel vm)
        {
            return View("/Views/Shared/_Header.cshtml", vm);
        }
    }

    public class CystemCommonFooter : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(ActionViewModel vm)
        {
            return View("/Views/Shared/_Footer.cshtml", vm);
        }
    }
}
