using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Website.Common.Enums;
using Website.Common.Extensions;

namespace Website.Views.HtmlHelpers
{
    public static partial class Cystem
    {
        public static CystemLink<TController> CystemNavigate<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action) where TController : class
        {
            return CystemNavigate(htmlHelper, action, new { }, new { });
        }

        public static CystemLink<TController> CystemNavigate<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action, object routeValues) where TController : class
        {
            return CystemNavigate(htmlHelper, action, routeValues, new { });
        }

        public static CystemLink<TController> CystemNavigate<TController>(this IHtmlHelper htmlHelper, Expression<Action<TController>> action, object routeValues, object htmlAttributes) where TController : class
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

        public static IHtmlContent LargeButton<T>(this IHtmlHelper<T> htmlHelper, string action, string controller, ElementAction actionResult, object routeValues = null, object htmlAttributes = null)
        {
            IUrlHelper urlHelper = new UrlHelper(htmlHelper.ViewContext);
            string url = urlHelper.Action(action, controller, routeValues);
            return LargeButton(htmlHelper, url, actionResult, htmlAttributes);
        }

        public static IHtmlContent LargeButton<T>(this IHtmlHelper<T> htmlHelper, string url, ElementAction actionResult, object htmlAttributes = null)
        {
            TagBuilder link = new TagBuilder("a");
            TagBuilder icon = new TagBuilder("i");

            icon.AddCssClass("material-icons");
            icon.InnerHtml.Append("add");

            if (htmlAttributes != null)
            {
                link.AddHtmlAttributes(htmlAttributes);
            }
            link.AddCssClass("ajax-get right btn-floating waves-effect waves-light btn-large");
            link.MergeAttribute("href", url);
            link.MergeAttribute("data-on-result", actionResult.ToString());
            link.InnerHtml.AppendHtml(icon);

            return link.Render();
        }

        public static IHtmlContent SubmitButton<T>(this IHtmlHelper<T> htmlHelper, string buttonText = "Submit", string iconName = "send", ElementAction actionResult = ElementAction.Close, string classes = "", object htmlAttributes = null)
        {
            TagBuilder button = new TagBuilder("button");
            TagBuilder icon = new TagBuilder("i");

            icon.AddCssClass("material-icons right");
            icon.InnerHtml.Append(iconName);

            if (htmlAttributes != null)
            {
                button.AddHtmlAttributes(htmlAttributes);
            }

            button.AddCssClass("ajax-submit btn waves-effect waves-light " + classes);
            button.MergeAttribute("type", "submit");
            button.MergeAttribute("data-on-result", actionResult.ToString());

            button.InnerHtml.Append(buttonText);
            button.InnerHtml.AppendHtml(icon);

            return button.Render();
        }

        public static IHtmlContent EditButton<T>(this IHtmlHelper<T> htmlHelper, string url, object routeValues = null, string buttonText = "Edit", ElementAction actionResult = ElementAction.Overlay, object htmlAttributes = null)
        {
            TagBuilder link = new TagBuilder("a");
            TagBuilder icon = new TagBuilder("i");

            icon.AddCssClass("material-icons right");
            icon.InnerHtml.Append("edit");

            if (htmlAttributes != null)
            {
                link.AddHtmlAttributes(htmlAttributes);
            }
            link.AddCssClass("ajax-get btn-flat waves-effect");
            link.MergeAttribute("href", url + ParseRouteValues(routeValues)) ;
            link.MergeAttribute("data-on-result", actionResult.ToString());

            link.InnerHtml.Append(buttonText);
            link.InnerHtml.AppendHtml(icon);

            return link.Render();
        }

        public static IHtmlContent DeleteButton<T>(this IHtmlHelper<T> htmlHelper, string url, object routeValues = null, string buttonText = "Delete", ElementAction actionResult = ElementAction.Close, object htmlAttributes = null)
        {
            TagBuilder link = new TagBuilder("a");
            TagBuilder icon = new TagBuilder("i");

            icon.AddCssClass("material-icons right");
            icon.InnerHtml.Append("delete");

            if (htmlAttributes != null)
            {
                link.AddHtmlAttributes(htmlAttributes);
            }
            link.AddCssClass("ajax-delete btn-flat waves-effect");
            link.MergeAttribute("href", url + ParseRouteValues(routeValues));
            link.MergeAttribute("data-on-result", actionResult.ToString());

            link.InnerHtml.Append(buttonText);
            link.InnerHtml.AppendHtml(icon);

            return link.Render();
        }


        private static string ParseRouteValues(object values)
        {
            string queryString = "";

            if (values == null) return queryString;

            RouteValueDictionary routeValues = new RouteValueDictionary(values);

            foreach(KeyValuePair<string, object> routeValue in routeValues)
            {
                queryString += queryString == "" ? "?" : "&";
                queryString += routeValue.Key + "=" + routeValue.Value.ToString();
            }

            return queryString;
        }
    }
}
