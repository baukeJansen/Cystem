using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Common.Data;
using Website.Common.Enums;
using Website.Common.Extensions;
using Website.ViewComponents;

namespace Website.Views.HtmlHelpers
{
    public partial class RenderHelper
    {
        public async Task<IHtmlContent> Button(string url, string buttonText, string icon, DisplaySetting options, object routeValues = null, ElementAction action = ElementAction.Load, object htmlAttributes = null, string cssClasses = "", bool link = true)
        {
            IDictionary<string, object> attributes = ParseHtmlAttributes(htmlAttributes);

            if (attributes.TryGetValue("class", out object _cssClasses))
            {
                cssClasses = _cssClasses.ToString() + " " + cssClasses;
            }

            attributes["class"] = cssClasses;
            attributes["data-on-result"] =  action.ToString();

            ButtonData buttonData = new ButtonData
            {
                Text = buttonText,
                Icon = icon,
                Url = url + ParseRouteValues(routeValues),
                Attributes = ParseAttributes(attributes),
                Options = options,
                Link = link
            };

            return await componentHelper.InvokeAsync(typeof(ButtonViewComponent), buttonData);
        }

        public async Task<IHtmlContent> SimpleButton(string url, string buttonText, DisplaySetting options, object routeValues = null, ElementAction action = ElementAction.Display, object htmlAttributes = null)
        {
            return await Button(url, buttonText, null, options, routeValues, action, htmlAttributes, "ajax-get btn-simple waves-effect");
        }

        public async Task<IHtmlContent> IconButton(string url, string icon, object routeValues = null, DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Display, object htmlAttributes = null)
        {
            return await Button(url, null, icon, options, routeValues, action, htmlAttributes, "ajax-get btn-flat waves-effect");
        }

        public async Task<IHtmlContent> FloatingButton(string url, string icon, object routeValues = null, DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null)
        {
            return await Button(url, null, icon, options, routeValues, action, htmlAttributes, "ajax-get right btn-floating waves-effect waves-light btn-large");
        }

        public async Task<IHtmlContent> CreateButton(string url, object routeValues = null, string buttonText = "New", string icon = "add", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null)
        {
            return await Button(url, null, icon, options, routeValues, action, htmlAttributes, "ajax-get btn-flat waves-effect");
        }

        public async Task<IHtmlContent> EditButton(string url, object routeValues = null, string buttonText = "Edit", string icon = "edit", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null)
        {
            return await Button(url, buttonText, icon, options, routeValues, action, htmlAttributes, "ajax-get btn-flat waves-effect");
        }


        public async Task<IHtmlContent> SubmitButton(string buttonText = "Submit", string icon = "send", ElementAction action = ElementAction.Close, string classes = "", object htmlAttributes = null)
        {
            IDictionary<string, object> attributes = ParseHtmlAttributes(htmlAttributes);
            attributes["type"] = "submit";
            return await Button(null, buttonText, icon, DisplaySetting.Display, null, action, htmlAttributes, "ajax-submit btn waves-effect waves-light " + classes, false);
        }

        public async Task<IHtmlContent> DeleteButton(string url, object routeValues = null, string buttonText = "Delete", string icon = "delete", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Close, object htmlAttributes = null)
        {
            return await Button(url, buttonText, icon, options, routeValues, action, htmlAttributes, "ajax-delete btn-flat waves-effect");
        }

        public async Task<IHtmlContent> DeleteModalButton(string url, object routeValues = null, string buttonText = "Delete", string icon = "delete", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Close, object htmlAttributes = null)
        {
            HtmlContentBuilder builder = new HtmlContentBuilder();
            IDictionary<string, object> attributes = ParseHtmlAttributes(htmlAttributes);
            attributes["data-target"] = "#modal";

            builder.AppendHtml(await Button("/cystem/delete-modal/", buttonText, icon, options, null, ElementAction.Modal, attributes, "ajax-get btn-flat waves-effect"));
            builder.AppendHtml(await Button(url, "", "", options, routeValues, action, htmlAttributes, "modal-accept ajax-delete hide"));
            return builder;
        }

        public async Task<IHtmlContent> SelectButton(string url, string buttonText, object routeValues = null, string icon = "arrow_forward", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null)
        {
            return await Button(url, buttonText, icon, options, routeValues, action, htmlAttributes, "ajax-get btn-flat waves-effect");
        }

        private string ParseRouteValues(object values)
        {
            string queryString = "";

            if (values == null) return queryString;

            RouteValueDictionary routeValues = new RouteValueDictionary(values);

            foreach (KeyValuePair<string, object> routeValue in routeValues)
            {
                queryString += queryString == "" ? "?" : "&";
                queryString += routeValue.Key + "=" + routeValue.Value.ToString();
            }

            return queryString;
        }

        private IDictionary<string, object> ParseHtmlAttributes(object htmlAttributes)
        {
            return HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes);
        }

        private string ParseAttributes(IDictionary<string, object> attributes)
        {
            string attributeString = "";
            foreach(KeyValuePair<string, object> attribute in attributes)
            {
                attributeString += attribute.Key + "=\"" + attribute.Value.ToString() + "\" ";
            }

            return attributeString;
        }
    }
}
