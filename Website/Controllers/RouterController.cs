using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Website.BL.SL.RouterSL;
using Website.Common.Enums;
using Website.Common.Exceptions;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.Controllers
{
    public class RouterController : JsActionController<GenericViewModel>
    {
        private readonly IRouterService service;

        public RouterController(IRouterService service)
        {
            this.service = service;
        }
        
        public IActionResult Route(GenericViewModel vm)
        {
            vm.Url = HttpContext.Request.Path;

            try { 
                
                vm = service.Get(vm);
                string template = service.GetTemplate(vm);
                return View(template, vm);
            }
            catch (InvalidPageException)
            {
                return View(vm);
            }
            catch (InvalidTemplateException)
            {
                return View(vm);
            }
        }
    }
}
