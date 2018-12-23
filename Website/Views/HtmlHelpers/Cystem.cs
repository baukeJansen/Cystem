using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Extensions;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;

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

        public static IHtmlContent DisplayValue<T>(this IHtmlHelper<T> htmlHelper, Value value)
        {
            if (value == null)
            {
                return HtmlString.Empty;
            }

            string type = value.GetType().ToString();
            type = type.Split('.').Last();

            //return HtmlHelperDisplayExtensions.DisplayFor(htmlHelper, m => value, type);
            return htmlHelper.DisplayFor(m => value, type);
        }

        public static IHtmlContent DisplayValue<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel vm, string label)
        {
            if (vm.Values == null)
            {
                return HtmlString.Empty;
            }

            foreach (Value value in vm.Values)
            {
                if (value.Attribute.Label == label)
                {
                    return DisplayValue(htmlHelper, value);
                }
            }

            return HtmlString.Empty;
        }

        public static IHtmlContent DisplayValue<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel vm,)
        {
            if (vm.Values == null)
            {
                return HtmlString.Empty;
            }

            HtmlContentBuilder builder = new HtmlContentBuilder();

            foreach (Value value in vm.Values) {
                IHtmlContentContainer content = (IHtmlContentContainer)DisplayValue(htmlHelper, value);
                content.MoveTo(builder);
            }

            return builder;
        }

        public static IHtmlContent EditValue<T>(this IHtmlHelper<T> htmlHelper, Value value)
        {
            if (value == null)
            {
                return HtmlString.Empty;
            }

            string type = value.GetType().ToString();
            type = type.Split('.').Last();

            return htmlHelper.EditorFor(m => value, type);
        }

        public static IHtmlContent EditValue<T>(this IHtmlHelper<T> htmlHelper, List<Value> values, string label)
        {
            if (values == null)
            {
                return HtmlString.Empty;
            }

            foreach (Value value in values)
            {
                if (value.Attribute.Label == label)
                {
                    return EditValue(htmlHelper, value);
                }
            }

            return HtmlString.Empty;
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

            if (htmlAttributes != null) {
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

        public static IHtmlContent DeleteButton<T>(this IHtmlHelper<T> htmlHelper, string action, string controller, string buttonText = "Delete", ElementAction actionResult = ElementAction.Close, object routeValues = null, object htmlAttributes = null)
        {
            IUrlHelper urlHelper = new UrlHelper(htmlHelper.ViewContext);
            string url = urlHelper.Action(action, controller, routeValues);
            return DeleteButton(htmlHelper, url, buttonText, actionResult, htmlAttributes);
        }

        public static IHtmlContent DeleteButton<T>(this IHtmlHelper<T> htmlHelper, string url, string buttonText = "Delete", ElementAction actionResult = ElementAction.Close, object htmlAttributes = null)
        {
            TagBuilder link = new TagBuilder("a");
            TagBuilder icon = new TagBuilder("i");

            icon.AddCssClass("material-icons right");
            icon.InnerHtml.Append("delete");

            if (htmlAttributes != null)
            {
                link.AddHtmlAttributes(htmlAttributes);
            }
            link.AddCssClass("ajax-delete btn-flat btn-outline waves-effect");
            link.MergeAttribute("href", url);
            link.MergeAttribute("data-on-result", actionResult.ToString());

            link.InnerHtml.Append(buttonText);
            link.InnerHtml.AppendHtml(icon);

            return link.Render();
        }
    }
}
