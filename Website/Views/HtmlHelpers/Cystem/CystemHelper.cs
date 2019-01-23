using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Extensions;
using Website.Common.Models.EAV;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Views.HtmlHelpers
{
    public class CystemHelper : ICystemHelper, IViewContextAware
    {
        private readonly IHtmlHelper Html;
        private readonly IValueHelper Value;
        private readonly IRenderHelper Render;
        private ViewContext viewContext;

        public CystemHelper(IHtmlHelper htmlHelper, IValueHelper valueHelper, IRenderHelper renderHelper)
        {
            Html = htmlHelper;
            Value = valueHelper;
            Render = renderHelper;
        }

        public IHtmlContent Link(Value link, string title = null, object htmlAttributes = null)
        {
            if (link == null) return new HtmlString("");
            string url;

            if (link.Type == ValueType.RelatedValue)
            {
                Value related = link.RelatedValue;
                url = related?.SerializedString ?? link.String;
                title = title ?? Value.Get(related, "Title")?.String ?? "Link";
            }
            else
            {
                url = link.String;
                title = title ?? Value.Get(link, "Title")?.String;
            }

            return Link(url, title, htmlAttributes);
        }

        public IHtmlContent Link(string url, string title = null, object htmlAttributes = null)
        {
            title = title ?? "Link";

            TagBuilder anchor = new TagBuilder("a");

            if (htmlAttributes != null)
            {
                anchor.AddHtmlAttributes(htmlAttributes);
            }
            anchor.AddCssClass("ajax-get");
            anchor.MergeAttribute("href", url);
            anchor.InnerHtml.Append(title);
            return anchor;
        }

        public IHtmlContent IconLink(string url, string iconName, object htmlAttributes = null)
        {
            TagBuilder anchor = new TagBuilder("a");
            TagBuilder icon = new TagBuilder("i");

            icon.AddCssClass("material-icons right");
            icon.InnerHtml.Append(iconName);

            if (htmlAttributes != null)
            {
                anchor.AddHtmlAttributes(htmlAttributes);
            }
            anchor.AddCssClass("ajax-get waves-effect");
            anchor.MergeAttribute("href", url);
            anchor.InnerHtml.AppendHtml(icon);
            return anchor;
        }

        public async Task DisplayChilds(Value value, DisplaySetting options = DisplaySetting.Display)
        {
            if (value == null) return;
            if (value.Values == null)
            {
                if (options == DisplaySetting.Alter)
                    value.Values = new List<Value>();
                else
                    return;
            }

            TagBuilder row = new TagBuilder("div");
            TagBuilder list = new TagBuilder("ul");

            row.AddCssClass("row");
            list.AddCssClass("collection value-collection");

            TextWriter writer = viewContext.Writer;

            writer.Write(row.RenderStartTag());
            writer.Write(list.RenderStartTag());

            if (options == DisplaySetting.Alter)
            {
                await Html.RenderPartialAsync("/Views/Templates/Alter/CreateValue.cshtml", value);
            }

            foreach (Value childValue in value.Values)
            {
                IHtmlContent content = await Render.Value(childValue, options);
                content.WriteTo(writer, HtmlEncoder.Default);
            }

            writer.Write(list.RenderEndTag());
            writer.Write(row.RenderEndTag());
        }

        public IHtmlContent Test(Func<Value, IHtmlContent> content)
        {
            HtmlContentBuilder builder = new HtmlContentBuilder();
            builder.AppendHtml(content(new Value() { String = "Test" }));
            return builder;
        }

        void IViewContextAware.Contextualize(ViewContext viewContext)
        {
            this.viewContext = viewContext;
            Render.Contextualize(viewContext);

            if (Html is IViewContextAware)
            {
                ((IViewContextAware)Html).Contextualize(viewContext);
            }
        }
    }
}
