using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
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
        
        public async Task<IActionResult> Route(GenericViewModel vm)
        {
            vm.Url = HttpContext.Request.Path;

            try { 
                vm = await service.Get(vm);
                return View(vm);
            }
            catch (InvalidPageException)
            {
                return View("Error", vm);
            }
            catch (InvalidTemplateException)
            {
                return View("Error", vm);
            }
        }
    }
}
