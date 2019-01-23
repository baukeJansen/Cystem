using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.Views.HtmlHelpers;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.ViewComponents
{
    public abstract class BaseViewComponent : ViewComponent
    {
        protected const string TemplateLocation = "/Views/Templates/";
        protected const string RenderPath = "Render/";
        protected const string DisplayPath = "Display/";
        protected const string EditPath = "Edit/";
        protected const string AlterPath = "Alter/";
        protected const string JsonPath = "Json/";
        protected const string XmlPath = "Xml/";
        protected const string FileType = ".cshtml";
        protected readonly List<string> TemplateAttributes = new List<string> { "page", "card", "overview", "edit", "group", "overview-entry", "modify-entry" };

        protected readonly IValueHelper valueHelper;

        public BaseViewComponent(IValueHelper valueHelper)
        {
            this.valueHelper = valueHelper;
        }

        public Value Get(List<Value> values, string label)
        {
            if (values == null) return null;
            return values.Where(v => v.Attribute.Label == label).FirstOrDefault();
        }


        public string GetViewLocation(GenericViewModel vm)
        {
            return GetViewLocation(vm.Value, vm.Options);
        }

        public string GetViewLocation(Value value, DisplaySetting option)
        {
            string viewPath = null;
            switch (option)
            {
                default:
                case DisplaySetting.Render:
                    viewPath = viewPath ?? ViewByValue(value);
                    viewPath = viewPath ?? ViewByAttribute(value);
                    viewPath = viewPath ?? ViewByType(value, RenderPath);
                    break;

                case DisplaySetting.Display:
                    viewPath = viewPath ?? ViewByType(value, DisplayPath);
                    break;

                case DisplaySetting.Edit:
                    viewPath = viewPath ?? ViewByValue(value);
                    if (value.Type == ValueType.IntValue || value.Type == ValueType.StringValue || value.Type == ValueType.RelatedAttribute)
                    {
                        viewPath = viewPath ?? ViewByType(value, EditPath);
                    }
                    viewPath = viewPath ?? ViewByAttribute(value);
                    viewPath = viewPath ?? ViewByType(value, RenderPath);
                    break;

                case DisplaySetting.Alter:
                    viewPath = viewPath ?? ViewByType(value, AlterPath);
                    break;

                case DisplaySetting.Json:
                    viewPath = viewPath ?? ViewByType(value, JsonPath);
                    break;

                case DisplaySetting.Xml:
                    viewPath = viewPath ?? ViewByType(value, XmlPath);
                    break;
            }

            return viewPath;
        }

        private string ViewByValue(Value value)
        {
            Value template = valueHelper.Get(value, "Template");
            if (template == null) return null;

            return TemplateLocation + RenderPath + template.String + FileType;
        }

        private string ViewByAttribute(Value value)
        {
            string _label = value.Attribute.Label.ToLower().Replace(' ', '-');
            if (!TemplateAttributes.Contains(_label)) return null;

            return TemplateLocation + RenderPath + _label + FileType;
        }

        private string ViewByType(Value value, string path)
        {
            return TemplateLocation + path + value.Type + FileType;
        }
    }
}
