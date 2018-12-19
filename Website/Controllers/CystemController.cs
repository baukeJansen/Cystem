using Microsoft.AspNetCore.Mvc;
using Website.BL.LL;
using Website.BL.SL.CystemSL;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    public class CystemController : JsActionController<BasicViewModel>
    {
        private readonly ICystemService service;

        public CystemController(ICystemService service)
        {
            this.service = service;
        }

        [HttpGet]
        public IActionResult Debug()
        {
            service.Test();
            return View("Overview");
        }
    }
}
