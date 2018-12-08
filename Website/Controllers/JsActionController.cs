using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    // Hide function not reachable warnings
    #pragma warning disable 414, CS0114

    public class JsActionController<TViewModel> : Controller where TViewModel : ActionViewModel
    {
        public IActionResult Succes()
        {
            return Ok("Succes");
        }

        /*public ViewResult View()
        {
            return base.View();
        }

        public ViewResult View(string viewName)
        {
            return base.View(viewName);
        }*/

        public ViewResult View<T>(T viewModel) where T : ActionViewModel
        {
            SetupView(viewModel);
            return base.View(viewModel);
        }

        public ViewResult View<T>(string viewName, T viewModel) where T : ActionViewModel
        {
            SetupView(viewModel);
            return base.View(viewName, viewModel);
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
