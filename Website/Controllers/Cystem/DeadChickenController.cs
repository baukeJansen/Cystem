using Microsoft.AspNetCore.Mvc;
using Website.BLL.DeadChickenBLL;
using Website.Common.Viewmodels;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")]
    public class DeadChickenController : BaseController
    {
        private readonly IDeadChickenLogic logic;

        public DeadChickenController(IDeadChickenLogic deadChickenLogic)
        {
            logic = deadChickenLogic;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return Overview();
        }

        [HttpGet]
        public IActionResult Overview()
        {
            DeadChickenOverviewViewModel vm = logic.GetOverview();
            return View("Overview", vm);
        }

        [HttpGet]
        public IActionResult Create()
        {
            DeadChickenViewModel vm = logic.Create();
            return View("Edit", vm);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            DeadChickenViewModel vm = logic.Get(id);
            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Store(DeadChickenViewModel vm)
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
