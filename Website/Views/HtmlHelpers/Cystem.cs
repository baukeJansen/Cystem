using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Views.HtmlHelpers
{
    public static partial class Cystem
    {
        public static string Value<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel vm, string label)
        {
            if (vm == null || vm.Value == null)
            {
                return "";
            }

            return Value(htmlHelper, vm.Value.Values, label);
        }

        public static string Value<T>(this IHtmlHelper<T> htmlHelper, Value value, string label)
        {
            if (value == null)
            {
                return "";
            }

            return Value(htmlHelper, value.Values, label);
        }

        public static string Value<T>(this IHtmlHelper<T> htmlHelper, List<Value> values, string label)
        {
            if (values == null)
                return "";

            Value value = GetValue(htmlHelper, values, label);
            if (value == null) return "";

            if (value.Type == ValueType.IntValue)
                return value.Int.ToString();

            if (value.Type == ValueType.SerializedStringValue)
                return value.SerializedString;

            return value.String;
        }

        public async static Task RenderValue<T>(this IHtmlHelper<T> htmlHelper, Value value, RenderOption options = RenderOption.Display)
        {
            await RenderValue(htmlHelper, new GenericViewModel { Value = value, Options = options });
        }

        public async static Task RenderValue<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel vm)
        {
            if (vm.Value == null)
            {
                return;
            }
            string template = GetTemplate(vm.Value, vm.Options);
            await htmlHelper.RenderPartialAsync(template, vm);
        }

        public async static Task RenderValue<T>(this IHtmlHelper<T> htmlHelper, List<Value> values, string label, RenderOption options = RenderOption.Display)
        {
            Value value = GetValue(htmlHelper, values, label);
            await RenderValue(htmlHelper, value, options);
        }

        public async static Task RenderValue<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel vm, string label)
        {
            List<Value> values = vm.Value.Values;

            if (values == null)
            {
                return;
            }

            foreach (Value value in values)
            {
                if (value.Attribute.Label == label)
                {
                    await RenderValue(htmlHelper, value, vm.Options);
                }
            }
        }

        public async static Task RenderValues<T>(this IHtmlHelper<T> htmlHelper, List<Value> values, RenderOption options)
        {
            if (values == null)
            {
                return;
            }

            foreach (Value value in values)
            {
                await RenderValue(htmlHelper, new GenericViewModel { Value = value, Options = options });
            }
        }

        public async static Task RenderValues<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel vm)
        {
            await RenderValues(htmlHelper, vm.Value.Values, vm.Options);
        }

        public async static Task EditValue<T>(this IHtmlHelper<T> htmlHelper, Value value, RenderOption options = RenderOption.Display)
        {
            GenericViewModel vm = new GenericViewModel { Value = value, Options = options };
            await htmlHelper.RenderPartialAsync("/Views/Shared/EditorTemplates/" + vm.Value.Type + ".cshtml", vm);
        }

        public static Value GetValue<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel model, string label)
        {
            if (model == null || model.Value == null) return null;
            return GetValue(htmlHelper, model.Value.Values, label);
        }

        public static Value GetValue<T>(this IHtmlHelper<T> htmlHelper, Value value, string label)
        {
            if (value == null) return null;
            return GetValue(htmlHelper, value.Values, label);
        }

        public static Value GetValue<T>(this IHtmlHelper<T> htmlHelper, List<Value> values, string label)
        {
            if (values == null) return null;

            foreach (Value value in values)
            {
                if (value.Attribute.Label == label)
                {
                    return value;
                }
            }

            return null;
        }

        public static Value GetValue<T>(this IHtmlHelper<T> htmlHelper, List<Value> values, ValueType type)
        {
            if (values == null) return null;

            foreach (Value value in values)
            {
                if (value.Type == type)
                {
                    return value;
                }
            }

            return null;
        }

        private static string GetTemplate(Value value, RenderOption option = RenderOption.Display)
        {
            List<string> Templates = new List<string> { "page", "template" };
            string Location = "/Views/Shared/";
            string Option = "DisplayTemplates/";
            string FileType = ".cshtml";

            string label = value.Attribute.Label.ToLower();

            if (Templates.Contains(label))
            {
                return Location + Option + label + FileType;
            }
            else
            {
                return Location + Option + value.Type.ToString() + FileType;
            }
        }

        /*public static IHtmlContent EditValue<T>(this IHtmlHelper<T> htmlHelper, GenericViewModel vm, string label)
        {
            List<Value> values = vm.Value.Values;

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
        }*/
    }
}
