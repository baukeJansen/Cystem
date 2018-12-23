using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace Website.Common.Extensions
{
    public static class TagbuilderExtensions
    {
        public static void AddHtmlAttributes(this TagBuilder tagBuilder, object htmlAttributes)
        {
            IDictionary<string, object> customAttributes = HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes);

            foreach (KeyValuePair<string, object> customAttribute in customAttributes)
            {
                tagBuilder.MergeAttribute(customAttribute.Key.ToString(), customAttribute.Value.ToString());
            }
        }

        public static IHtmlContent Render(this TagBuilder tagBuilder)
        {
            using(StringWriter writer = new StringWriter())
            {
                tagBuilder.WriteTo(writer, HtmlEncoder.Default);
                return new HtmlString(writer.ToString());
            }
        }

        public static string RenderAsString(this TagBuilder tagBuilder)
        {
            using(StringWriter writer = new StringWriter())
            {
                tagBuilder.WriteTo(writer, HtmlEncoder.Default);
                return writer.ToString();
            }
        }
    }
}
