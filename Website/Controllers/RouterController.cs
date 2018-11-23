using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.Controllers
{
    public class RouterController : BaseController
    {
        private readonly DataContext context;

        public RouterController(DataContext context)
        {
            this.context = context;
        }

        public IActionResult Route()
        {
            string route = HttpContext.Request.Path;
            var ps = context.Pages.ToList();
            Page page = context.Pages.Where(p => p.Url == route).FirstOrDefault();

            if (page != null)
            {
                TemplateViewModel tvm = new TemplateViewModel();
                return View("Template" + page.TemplateId, tvm);
            }

            BasicViewModel vm = new BasicViewModel();
            return View(vm);
        }
    }
}
