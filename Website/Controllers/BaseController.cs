using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System.Collections.Generic;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    public abstract class BaseController : Controller
    {
        public IActionResult Succes()
        {
            return Ok("Succes");
        }

        public IActionResult View<T>(T viewModel) where T : ViewModel
        {
            SetupView(viewModel);
            return base.View(viewModel);
        }

        public IActionResult View<T>(string viewName, T viewModel) where T : ViewModel
        {
            SetupView(viewModel);
            return base.View(viewName, viewModel);

        }

        private void SetupView<T>(T viewModel) where T : ViewModel
        {
            bool jsPage = HttpContext.Request.Query["jsPage"].ToString() == "true";
            bool overlay = HttpContext.Request.Query["overlay"].ToString() == "true";
            string url = HttpContext.Request.Path + GetQueryParams();

            viewModel.JsPage = jsPage;
            viewModel.Overlay = overlay;
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