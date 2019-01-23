using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Net.Http;

namespace Website.Views.HtmlHelpers
{
    public static class HtmlHelperExtensions
    {
        public static IHtmlContent HttpMethodOverride<TModel>(this HtmlHelper<TModel> htmlHelper, HttpMethod method)
        {
            return htmlHelper.Hidden("_method", method.Method);
        }
    }
}
