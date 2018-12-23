using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using Website.BL.SL.CystemSL;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.DAL;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Controllers
{
    public class CystemController : JsActionController<ValueViewModel>
    {
        private readonly ICystemService service;

        public CystemController(ICystemService service, DataContext context, IMapper mapper)
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
