using Microsoft.AspNetCore.Mvc;
using Website.BL.LL;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    public class CystemController : JsActionController<BasicViewModel>
    {
        public CystemController()
        {

        }

        [HttpGet]
        public IActionResult Index(BasicViewModel vm)
        {
            return Overview(vm);
        }

        [HttpGet]
        public IActionResult Overview(BasicViewModel vm)
        {
            return View("Overview", vm);
        }
    }
}
