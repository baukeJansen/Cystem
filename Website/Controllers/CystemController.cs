using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Website.BL.SL.CystemSL;
using Website.Common.Viewmodels;
using Website.DAL;
using Website.Views.HtmlHelpers;

namespace Website.Controllers
{
    public class CystemController : JsActionController<ValueViewModel>
    {
        private readonly ICystemService service;

        public CystemController(ICystemService service, DataContext context, IMapper mapper, IValueHelper valueHelper) : base(valueHelper)
        {
            this.service = service;
        }

        [HttpGet]
        public IActionResult Debug()
        {
            //service.Test();
            return View("Overview");
        }
    }
}
