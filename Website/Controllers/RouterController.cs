using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.Controllers
{
    public class RouterController : JsActionController<BasicViewModel>
    {
        private readonly DataContext context;
        private readonly IMapper mapper;

        public RouterController(DataContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public IActionResult Route(BasicViewModel vm)
        {
            string route = HttpContext.Request.Path;
            var ps = context.Pages.ToList();
            Page page = context.Pages.Where(p => p.Url == route).FirstOrDefault();

            if (page != null)
            {
                TemplateViewModel tvm = mapper.Map<TemplateViewModel>(vm);
                return View("Template" + page.TemplateId, tvm);
            }

            return View(vm);
        }
    }
}
