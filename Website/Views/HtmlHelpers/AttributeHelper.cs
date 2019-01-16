using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.DAL;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.Views.HtmlHelpers
{
    public class AttributeHelper : IAttributeHelper, IViewContextAware
    {
        private readonly IHtmlHelper Html;
        private readonly IServiceProvider provider;

        public AttributeHelper(IHtmlHelper htmlHelper, IServiceProvider provider)
        {
            Html = htmlHelper;
            this.provider = provider;
        }

        public async Task Render(Attribute attribute, DisplaySetting options = DisplaySetting.Render)
        {
            if (attribute == null) return;

            string template = GetTemplate(attribute, options);
            await Html.RenderPartialAsync(template, attribute);
        }

        public List<Attribute> GetAttributes()
        {
            DataContext context = provider.GetRequiredService<DataContext>();
            return context.Attributes.ToList();
        }

        private string GetTemplate(Attribute attribute, DisplaySetting option = DisplaySetting.Render)
        {
            string Location = "/Views/Templates/";
            string Render = "Render/";
            string Display = "Display/";
            string Edit = "Edit/";
            string FileType = ".cshtml";

            switch (option)
            {
                default:
                case DisplaySetting.Render:
                    return Location + Display + "Attribute" + FileType;
               case DisplaySetting.Display:
                    return Location + Display + "Attribute" + FileType;
                case DisplaySetting.Edit:
                    return Location + Edit + "Attribute" + FileType;
            }
        }

        void IViewContextAware.Contextualize(ViewContext viewContext)
        {
            if (Html is IViewContextAware)
            {
                ((IViewContextAware)Html).Contextualize(viewContext);
            }
        }
    }
}
