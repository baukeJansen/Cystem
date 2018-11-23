using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    public class CommonController : BaseController
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
