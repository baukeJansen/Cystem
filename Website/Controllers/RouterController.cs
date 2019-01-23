using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using System.Threading.Tasks;
using Website.BL.SL.RouterSL;
using Website.Common.Enums;
using Website.Common.Exceptions;
using Website.Common.Viewmodels;
using Website.Views.HtmlHelpers;

namespace Website.Controllers
{
    public class RouterController : BaseController<GenericViewModel>
    {
        private readonly IRouterService service;

        public RouterController(IRouterService service, IValueHelper valueHelper) : base(valueHelper)
        {
            this.service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Route(GenericViewModel viewModel)
        {
            return await HandleErrors(viewModel, async (GenericViewModel vm) =>
            {
                vm.Url = HttpContext.Request.Path;
                vm = await service.Get(vm);
                return View(vm);
            });
        }

        [HttpPost]
        [ActionName("Route")]
        public async Task<IActionResult> Store(GenericViewModel viewModel)
        {
            return await HandleErrors(viewModel, async (GenericViewModel vm) =>
            {
                service.Store(vm);
                return Ok();
            });
        }

        [HttpDelete]
        [ActionName("Route")]
        public async Task<IActionResult> Delete(GenericViewModel viewModel)
        {
            return await HandleErrors(viewModel, async (GenericViewModel vm) =>
            {
                await service.Delete(vm);
                return Ok();
            });
        }
    }
}
