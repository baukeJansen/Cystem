using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models;
using Website.DAL;

namespace Website.Views.HtmlHelpers
{
    public class GroupHelper : IGroupHelper, IViewContextAware
    {
        private readonly IHtmlHelper Html;
        private readonly IServiceProvider provider;

        public GroupHelper(IHtmlHelper htmlHelper, IServiceProvider provider)
        {
            Html = htmlHelper;
            this.provider = provider;
        }

        public async Task Render(Group group, DisplaySetting options = DisplaySetting.Render)
        {
            if (group == null) return;

            string template = GetTemplate(group, options);
            await Html.RenderPartialAsync(template, group);
        }

        public List<Group> GetGroups()
        {
            DataContext context = provider.GetRequiredService<DataContext>();
            return context.Groups.ToList();
        }

        private string GetTemplate(Group group, DisplaySetting option = DisplaySetting.Render)
        {
            string Location = "/Views/Templates/";
            //string Render = "Render/";
            string Display = "Display/";
            string Edit = "Edit/";
            string FileType = ".cshtml";

            switch (option)
            {
                default:
                case DisplaySetting.Render:
                    return Location + Display + "Group" + FileType;
               case DisplaySetting.Display:
                    return Location + Display + "Group" + FileType;
                case DisplaySetting.Edit:
                    return Location + Edit + "Group" + FileType;
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
