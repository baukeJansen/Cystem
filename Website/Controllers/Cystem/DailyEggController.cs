using Microsoft.AspNetCore.Mvc;
using Website.BLL;
using Website.BLL.DailyEggBLL;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")]
    public class DailyEggController : BaseController
    {
        private readonly IDailyEggLogic logic;

        public DailyEggController(IDailyEggLogic dailyEggLogic)
        {
            logic = dailyEggLogic;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return Overview();
        }

        [HttpGet]
        public IActionResult Overview()
        {
            DailyEggOverviewViewModel vm = logic.GetOverview();
            return View("Overview", vm);
        }

        [HttpGet]
        public IActionResult Create()
        {
            DailyEggViewModel vm = logic.Create();
            return View("Edit", vm);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            DailyEggViewModel vm = logic.Get(id);
            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Store(DailyEggViewModel vm)
        {
            logic.Store(vm);
            return Succes();
        }

        [HttpDelete]
        public IActionResult Delete(int id)
        {
            logic.Delete(id);
            return Succes();
        }
    }
}
