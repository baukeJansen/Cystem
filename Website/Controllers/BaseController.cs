using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Exceptions;
using Website.Common.Viewmodels;
using Website.Views.HtmlHelpers;

namespace Website.Controllers
{
    // Hide function not reachable warnings
    #pragma warning disable 414, CS0114

    public class BaseController<TViewModel> : Controller where TViewModel : ActionViewModel
    {
        private readonly IValueHelper valueHelper;

        public BaseController(IValueHelper valueHelper)
        {
            this.valueHelper = valueHelper;
        }

        public IActionResult Succes()
        {
            return Ok("Succes");
        }

        public ViewResult View()
        {
            return base.View();
        }

        public ViewResult View(string viewName)
        {
            return base.View(viewName);
        }

        public IActionResult View<T>(T viewModel) where T : ActionViewModel
        {
            SetupView(viewModel);
            return LayoutRedirect(viewModel) ?? base.View(viewModel);
        }

        public IActionResult View<T>(string viewName, T viewModel) where T : ActionViewModel
        {
            SetupView(viewModel);
            return LayoutRedirect(viewModel) ?? base.View(viewName, viewModel);
        }

        public async Task<IActionResult> HandleErrors<T>(T viewModel, Func<T, Task<IActionResult>> action) where T : ActionViewModel
        {
            try
            {
                return await action(viewModel);
            }
            catch (InvalidPageException exception)
            {
                IMapper mapper = (IMapper)HttpContext.RequestServices.GetService(typeof(IMapper));
                ExceptionViewModel vm = new ExceptionViewModel { Exception = exception };
                mapper.Map(viewModel, vm);
                return View("/Views/Router/Error.cshtml", vm);
            }
            catch (InvalidTemplateException exception)
            {
                IMapper mapper = (IMapper)HttpContext.RequestServices.GetService(typeof(IMapper));
                ExceptionViewModel vm = new ExceptionViewModel { Exception = exception };
                mapper.Map(viewModel, vm);
                return View("/Views/Router/Error.cshtml", vm);
            }
        }

        private IActionResult LayoutRedirect(ActionViewModel model)
        {
            if (model == null) return null;
            Layouts currentLayout = model.CurrentLayout;

            if (model is GenericViewModel)
            {
                if (Enum.TryParse(valueHelper.Display((GenericViewModel)model, "Layout"), true, out Layouts newLayout))
                {
                    if (newLayout != Layouts.None)
                    {
                        if (currentLayout == Layouts.None)
                        {
                            currentLayout = newLayout;
                        }

                        if (newLayout != currentLayout)
                        {
                            if (model.Layout == Layouts.AjaxLayout)
                            {
                                return StatusCode((int)HttpStatusCode.ResetContent);
                            }

                            currentLayout = newLayout;
                        }
                    }
                }
            }

            if (model.Layout == Layouts.None)
            {
                model.Layout = currentLayout;
            }

            if (model.Layout == Layouts.None)
            {
                model.Layout = Layouts.CystemLayout;
            }

            return null;
        }

        private void SetupView(ActionViewModel viewModel)
        {
            string url = HttpContext.Request.Path + GetQueryParams();
            viewModel.Url = url;
        }

        private string GetQueryParams()
        {
            string queryString = "";

            IQueryCollection query = HttpContext.Request.Query;
            foreach (KeyValuePair<string, StringValues> param in query)
            {
                if (param.Key == "jsPage" || param.Key == "overlay")
                {
                    continue;
                }

                foreach (string value in param.Value)
                {
                    queryString += queryString == "" ? "?" : "&";
                    queryString += param.Key + "=" + value;

                }
            }

            return queryString;
        }
    }
}
