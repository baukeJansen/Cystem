using Microsoft.AspNetCore.Mvc;
using Website.BL.SL.DailyEggSL;
using Website.Common.Viewmodels;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")]
    public class DailyEggController : JsActionController<DailyEggViewModel>
    {
        private readonly IDailyEggService service;

        public DailyEggController(IDailyEggService service)
        {
            this.service = service;
        }

        [HttpGet]
        public IActionResult Index(DailyEggOverviewViewModel vm)
        {
            return Overview(vm);
        }

        [HttpGet]
        public IActionResult Overview(DailyEggOverviewViewModel vm)
        {
            return View("Overview", service.GetOverview(vm));
        }

        [HttpGet]
        public IActionResult Create(DailyEggViewModel vm)
        {
            return View("Edit", service.Create(vm));
        }

        [HttpGet]
        public IActionResult Edit(DailyEggViewModel vm)
        {
            return View(service.Get(vm));
        }

        [HttpPost]
        public IActionResult Store(DailyEggViewModel vm)
        {
            service.Store(vm);
            return Succes();
        }

        [HttpDelete]
        public IActionResult Delete(DailyEggViewModel vm)
        {
            service.Delete(vm);
            return Succes();
        }
    }
}
    