﻿using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.ViewComponents;

namespace Website.Views.HtmlHelpers
{
    public partial class RenderHelper
    {
        public async Task<IHtmlContent> Button(string url, string buttonText, string icon, DisplaySetting options, object routeValues = null, ComponentAction action = ComponentAction.Load, ComponentType target = ComponentType.Self, object htmlAttributes = null, string cssClasses = "", bool link = true)
        {
            IDictionary<string, object> attributes = ParseHtmlAttributes(htmlAttributes);

            if (attributes.TryGetValue("class", out object _cssClasses))
            {
                cssClasses = _cssClasses.ToString() + " " + cssClasses;
            }

            attributes["class"] = cssClasses;
            attributes["data-action"] =  action.ToString();
            attributes["data-target"] = target.ToString();
            url = url == null ? null : url + ParseRouteValues(routeValues);

            GenericViewModel viewModel = new GenericViewModel
            {
                Value = new Value
                {
                    Group = new Group { Label = "Link" },
                    String = url,
                    Values = new List<Value>
                    {
                        new Value
                        {
                            Group = new Group { Label = "Template" },
                            String = link ? "link" : "button"
                        },
                        new Value
                        {
                            Group = new Group { Label = "Text" },
                            String = buttonText
                        },
                        new Value
                        {
                            Group = new Group { Label = "Icon" },
                            String = icon
                        },
                        new Value
                        {
                            Group = new Group{ Label = "Attributes" },
                            String = ParseAttributes(attributes)
                        }
                    }
                },
                Options = options
            };

            /*ButtonData buttonData = new ButtonData
            {
                Text = buttonText,
                Icon = icon,
                Url = url + ParseRouteValues(routeValues),
                Attributes = ParseAttributes(attributes),
                Options = options,
                Link = link
            };*/

            return await componentHelper.InvokeAsync(typeof(RenderViewComponent), viewModel);
        }

        public async Task<IHtmlContent> SimpleButton(string url, string buttonText, DisplaySetting options, object routeValues = null, ComponentAction action = ComponentAction.Load, ComponentType target = ComponentType.Self, object htmlAttributes = null)
        {
            return await Button(url, buttonText, null, options, routeValues, action, target, htmlAttributes, "link btn-simple waves-effect");
        }

        public async Task<IHtmlContent> IconButton(string url, string icon, object routeValues = null, DisplaySetting options = DisplaySetting.Render, ComponentAction action = ComponentAction.Load, ComponentType target = ComponentType.Self, object htmlAttributes = null)
        {
            return await Button(url, null, icon, options, routeValues, action, target, htmlAttributes, "link btn-flat waves-effect");
        }

        public async Task<IHtmlContent> FloatingButton(string url, string icon, object routeValues = null, DisplaySetting options = DisplaySetting.Render, ComponentAction action = ComponentAction.Load, ComponentType target = ComponentType.Overlay, object htmlAttributes = null)
        {
            return await Button(url, null, icon, options, routeValues, action, target, htmlAttributes, "link right btn-floating waves-effect waves-light btn-large");
        }

        public async Task<IHtmlContent> CreateButton(string url, object routeValues = null, string buttonText = "New", string icon = "add", DisplaySetting options = DisplaySetting.Render, ComponentAction action = ComponentAction.Load, ComponentType target = ComponentType.Overlay, object htmlAttributes = null)
        {
            string buttonClass = string.IsNullOrEmpty(buttonText) ? "btn-simple" : "btn-flat";
            return await Button(url, null, icon, options, routeValues, action, target, htmlAttributes, "link waves-effect" + buttonClass);
        }

        public async Task<IHtmlContent> EditButton(string url, object routeValues = null, string buttonText = "Edit", string icon = "edit", DisplaySetting options = DisplaySetting.Render, ComponentAction action = ComponentAction.Load, ComponentType target = ComponentType.Overlay, object htmlAttributes = null)
        {
            string buttonClass = string.IsNullOrEmpty(buttonText) ? "btn-simple" : "btn-flat";
            return await Button(url, buttonText, icon, options, routeValues, action, target, htmlAttributes, "link waves-effect " + buttonClass);
        }


        public async Task<IHtmlContent> SubmitButton(string buttonText = "Submit", string icon = "send", ComponentAction action = ComponentAction.Close, ComponentType target = ComponentType.Self, string classes = "", object htmlAttributes = null)
        {
            IDictionary<string, object> attributes = ParseHtmlAttributes(htmlAttributes);
            attributes["type"] = "submit";
            return await Button(null, buttonText, icon, DisplaySetting.Render, null, action, target, htmlAttributes, "submit btn waves-effect waves-light " + classes, false);
        }

        public async Task<IHtmlContent> DeleteButton(string url, object routeValues = null, string buttonText = "Delete", DisplaySetting options = DisplaySetting.Render, ComponentAction action = ComponentAction.Close, ComponentType target = ComponentType.Self, object htmlAttributes = null)
        {
            return await Button(url, buttonText, "delete", options, routeValues, action, target, htmlAttributes, "link btn-flat waves-effect");
        }

        public async Task<IHtmlContent> DeleteModalButton(Value value, string buttonText = "Delete", DisplaySetting options = DisplaySetting.Render, ComponentAction action = ComponentAction.Load, ComponentType target = ComponentType.Modal, object htmlAttributes = null)
        {
            HtmlContentBuilder builder = new HtmlContentBuilder();
            IDictionary<string, object> attributes = ParseHtmlAttributes(htmlAttributes);
            attributes["data-target"] = "#modal";
            string buttonClass = string.IsNullOrEmpty(buttonText) ? "btn-simple" : "btn-flat";

            builder.AppendHtml(await Button("/cystem/confirm-delete/", buttonText, "delete", options, new { value.Id }, action, target, attributes, "link waves-effect " + buttonClass));
            return builder;
        }

        public async Task<IHtmlContent> SelectButton(string url, string buttonText, object routeValues = null, string icon = "arrow_forward", DisplaySetting options = DisplaySetting.Render, ComponentAction action = ComponentAction.Select, ComponentType target = ComponentType.Overlay, object htmlAttributes = null)
        {
            return await Button(url, buttonText, icon, options, routeValues, action, target, htmlAttributes, "link btn-flat waves-effect select-button");
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
