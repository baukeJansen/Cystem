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



        public IActionResult View()
        {
            return base.View();
        }

        public IActionResult View(string viewName)
        {
            return base.View(viewName);
        }

        public IActionResult View(object viewModel)
        {
            if(!(viewModel is ActionViewModel)) {
                throw new Exception();
            }

            SetupView((ActionViewModel)viewModel);
            return base.View(viewModel);
        }

        public IActionResult View(string viewName, object viewModel)
        {
            if (!(viewModel is ActionViewModel))
            {
                throw new Exception();
            }

            SetupView((ActionViewModel)viewModel);
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
