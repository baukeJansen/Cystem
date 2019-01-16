using Microsoft.AspNetCore.Mvc;
using Website.BL.SL.DeadChickenSL;
using Website.Common.Viewmodels;
using Website.Views.HtmlHelpers;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")]
    public class DeadChickenController : JsActionController<DeadChickenViewModel>
    {
        private readonly IDeadChickenService service;

        public DeadChickenController(IDeadChickenService service, IValueHelper valueHelper) : base(valueHelper)
        {
            this.service = service;
        }

        [HttpGet]
        public IActionResult Index(DeadChickenOverviewViewModel vm)
        {
            return Overview(vm);
        }

        [HttpGet]
        public IActionResult Overview(DeadChickenOverviewViewModel vm)
        {
            
            return View("Overview", service.GetOverview(vm));
        }

        [HttpGet]
        public IActionResult Create(DeadChickenViewModel vm)
        {
            return View("Edit", service.Create(vm));
        }

        [HttpGet]
        public IActionResult Edit(DeadChickenViewModel vm)
        {
            return View(service.Create(vm));
        }

        [HttpPost]
        public IActionResult Store(DeadChickenViewModel viewModel)
        {
            service.Store(viewModel);
            return Succes();
        }

        [HttpDelete]
        public IActionResult Delete(DeadChickenViewModel vm)
        {
            service.Delete(vm);
            return Succes();
        }
    }
}
