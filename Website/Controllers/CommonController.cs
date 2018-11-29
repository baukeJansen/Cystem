using Microsoft.AspNetCore.Mvc;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    public class CommonController : JsActionController<BasicViewModel>
    {
        public IActionResult Header()
        {
            ViewModel vm = new BasicViewModel();

            return View(vm);
        }

        public IActionResult Footer()
        {
            ViewModel vm = new BasicViewModel();

            return View(vm);
        }
    }
}
