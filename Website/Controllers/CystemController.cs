using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Website.BL.LL.ValueLL;
using Website.BL.SL.CystemSL;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;
using Website.Views.HtmlHelpers;

namespace Website.Controllers
{
    public class CystemController : BaseController<ValueViewModel>
    {
        private readonly ICystemService service;
        private readonly IValueLogic valueLogic;

        public CystemController(ICystemService service, IValueLogic valueLogic, DataContext context, IMapper mapper, IValueHelper valueHelper) : base(valueHelper)
        {
            this.service = service;
            this.valueLogic = valueLogic;
        }

        [ActionName("delete-details")]
        public async Task<IActionResult> ConfirmDelete(GenericViewModel viewModel)
        {
            return await HandleErrors(viewModel, async (GenericViewModel vm) =>
            {
                vm.Url = HttpContext.Request.Path;
                vm = await service.PreviewDelete(vm);

                return View("/Views/Router/Route.cshtml", vm);
            });
        }

        [ActionName("graph-data")]
        public async Task<IActionResult> GraphData(GenericViewModel viewModel)
        {
            return await HandleErrors(viewModel, async (GenericViewModel vm) =>
            {
                vm.Url = HttpContext.Request.Path;
                Value data = await valueLogic.Get(169);
                vm.Value = 

                return View("/Views/Router/Route.cshtml", vm);
            });
        }

        [HttpGet]
        public IActionResult Debug()
        {
            //service.Test();
            return View();
        }
    }
}
