using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.BL.SL.DatatableSL;
using Website.Common.Viewmodels;
using Website.Views.HtmlHelpers;

namespace Website.Controllers.Cystem
{
    public class DatatableController : JsActionController<DatatableViewModel>
    {
        private readonly IDatatableService service;

        public DatatableController(IDatatableService service, IValueHelper valueHelper) : base(valueHelper)
        {
            this.service = service;
        }

        [HttpGet]
        public IActionResult Index(DatatableViewModel vm)
        {
            return View("Datatable", vm);
        }
    }
}
