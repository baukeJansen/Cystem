using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.Linq;
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
    }
}
