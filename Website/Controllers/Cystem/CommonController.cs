using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Reflection;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Website.Common.Viewmodels;

namespace Website.Controllers
{
    [Area("Cystem")]
    public class CommonController : JsActionController<BasicViewModel>
    {
        private readonly IHttpContextFactory httpContextFactory;

        public CommonController(IHttpContextFactory httpContextFactory)
        {
            this.httpContextFactory = httpContextFactory;
        }

        public IActionResult Load(BundleViewModel vm)
        {
            List<PartialViewResult> partialViewResults = new List<PartialViewResult>();
            IRouteCollection router = RouteData.Routers.OfType<IRouteCollection>().First();

            foreach(string viewName in vm.Actions)
            {
                /*Uri uri = new Uri(url);
                string path = uri.GetComponents(UriComponents.Path, UriFormat.Unescaped);
                string query = uri.GetComponents(UriComponents.Query, UriFormat.Unescaped);

                NameValueCollection name = HttpUtility.ParseQueryString(query);
                vm.Results.Add(PartialView(url, vm));


                HttpContext context = httpContextFactory.Create(HttpContext.Features);
                context.Request.Path = path;
                context.Request.Method = HttpMethods.Get;

                var routeContext = new RouteContext(context);
                //Run it through the router
                await router.RouteAsync(routeContext);


                //If router assigned a handler, URL matches an action
                bool exists = routeContext.Handler != null;
                RouteValueDictionary routeValues = routeContext.RouteData.Values;
                string action = (string)routeValues.GetValueOrDefault("action");*/

                partialViewResults.Add(PartialView(viewName, vm));
            }

            vm.Results = partialViewResults;
            return View(vm);
        }

        public IActionResult Header(BasicViewModel vm)
        {
            return View("_Header", vm);
        }

        public IActionResult Footer(BasicViewModel vm)
        {
            return View("_Footer", vm);
        }
    }
}
