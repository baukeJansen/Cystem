using Microsoft.AspNetCore.Html;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
using System;

namespace Website.Views.HtmlHelpers
{
    public interface ICystemHelper
    {
        IHtmlContent Link(Value link, string title = null, object htmlAttributes = null);
        IHtmlContent Link(string url, string title = null, object htmlAttributes = null);
        IHtmlContent IconLink(string url, string icon, object htmlAttributes = null);

        Task DisplayChilds(Value value, DisplaySetting options = DisplaySetting.Display);
        IHtmlContent Test(Func<Value, IHtmlContent> content);
    }
}
