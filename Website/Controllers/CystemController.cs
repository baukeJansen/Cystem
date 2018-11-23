using Microsoft.AspNetCore.Mvc;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    public class CystemController : BaseController
    {
        public IActionResult Index()
        {
            SystemViewModel vm = new SystemViewModel
            {
                test = 1
            };

            return View(vm);
        }

        public IActionResult Test()
        {
            ViewModel vm = new TestViewModel();

            return View(vm);
        }
    }
}
