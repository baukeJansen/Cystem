using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Extensions;
using Website.Common.Models.EAV;

namespace Website.Views.HtmlHelpers
{
    public static class Cystem
    {
        public static CystemLink<TController> CystemNavigate<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action) where TController : class
        {
            return CystemNavigate(htmlHelper, action, new { }, new { });
        }

        public static CystemLink<TController> CystemNavigate<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action, object routeValues) where TController : class
        {
            return CystemNavigate(htmlHelper, action, routeValues, new { });
        }

        public static CystemLink<TController> CystemNavigate<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action, object routeValues,  object htmlAttributes) where TController : class
        {
            return new CystemLink<TController>(htmlHelper.ViewContext, action, routeValues, htmlAttributes, LinkType.Navigate);
        }

        public static CystemLink<TController> CystemOverlay<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action) where TController : class
        {
            return CystemOverlay(htmlHelper, action, new { }, new { });
        }

        public static CystemLink<TController> CystemOverlay<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action, object routeValues) where TController : class
        {
            return CystemOverlay(htmlHelper, action, routeValues, new { });
        }

        public static CystemLink<TController> CystemOverlay<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action, object routeValues, object htmlAttributes) where TController : class
        {
            return new CystemLink<TController>(htmlHelper.ViewContext, action, routeValues, htmlAttributes, LinkType.Popup);
        }

        public static IHtmlContent CystemSubmitButton(this IHtmlHelper htmlHelper, string buttonText, string classes)
        {
            return CystemSubmitButton(htmlHelper, buttonText, classes, new { });
        }

        public static IHtmlContent CystemSubmitButton(this IHtmlHelper htmlHelper, string buttonText, string classes, object htmlAttributes)
        {
            var button = new TagBuilder("input");
            button.AddCssClass("ajax-submit btn waves-effect " + classes);
            button.MergeAttribute("value", buttonText);
            button.MergeAttribute("type", "submit");

            button.AddHtmlAttributes(htmlAttributes);

            return button.RenderSelfClosingTag();
        }

        public static IHtmlContent DisplayValue<T>(this IHtmlHelper<T> htmlHelper, Value value)
        {
            if (value == null)
            {
                return HtmlString.Empty;
            }

            string type = value.GetType().ToString();
            type = type.Split('.').Last();

            return HtmlHelperDisplayExtensions.DisplayFor(htmlHelper, m => value, type);
        }

        public static IHtmlContent DisplayValue<T>(this IHtmlHelper<T> htmlHelper, List<Value> values, string label)
        {
            if (values == null)
            {
                return HtmlString.Empty;
            }

            foreach (Value value in values)
            {
                if (value.Attribute.Label == label)
                {
                    return DisplayValue(htmlHelper, value);
                }
            }

            return HtmlString.Empty;
        }

        public static IHtmlContent DisplayValue<T>(this IHtmlHelper<T> htmlHelper, List<Value> values)
        {
            if (values == null)
            {
                return HtmlString.Empty;
            }

            HtmlContentBuilder builder = new HtmlContentBuilder();

            foreach (Value value in values) {
                IHtmlContentContainer content = (IHtmlContentContainer)DisplayValue(htmlHelper, value);
                content.MoveTo(builder);
            }

            return builder;
        }
    }
}
