using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Views.HtmlHelpers
{
    public class ValueHelper : IValueHelper, IViewContextAware
    {   
        private readonly List<string> TemplateAttributes = new List<string> { "page", "overview", "edit", "group" };
        private readonly IHtmlHelper Html;

        public ValueHelper(IHtmlHelper htmlHelper)
        {
            Html = htmlHelper;
        }

        /* Get */
        public Value Get(GenericViewModel model, string label)
        {
            if (model == null || model.Value == null) return null;
            return Get(model.Value.Values, label);
        }

        public Value Get(Value value, string label)
        {
            if (value == null) return null;
            return Get(value.Values, label);
        }

        public Value Get(List<Value> values, string label)
        {
            if (values == null) return null;
            return values.Where(v => v.Attribute.Label == label).FirstOrDefault();
        }

        public Value Get(GenericViewModel model, ValueType type)
        {
            if (model == null || model.Value == null) return null;
            return Get(model.Value.Values, type);
        }

        public Value Get(Value value, ValueType type)
        {
            if (value == null) return null;
            return Get(value.Values, type);
        }

        public Value Get(List<Value> values, ValueType type)
        {
            if (values == null) return null;
            return values.Where(v => v.Type == type).FirstOrDefault();
        }

        /* Get all */
        public List<Value> GetAll(GenericViewModel model, string label)
        {
            if (model == null || model.Value == null) return null;
            return GetAll(model.Value.Values, label);
        }

        public List<Value> GetAll(Value value, string label)
        {
            if (value == null) return null;
            return GetAll(value.Values, label);
        }
        public List<Value> GetAll(List<Value> values, string label)
        {
            if (values == null) return new List<Value>();
            return values.Where(v => v.Attribute.Label == label).ToList();
        }

        public List<Value> GetAll(GenericViewModel model, ValueType type)
        {
            if (model == null || model.Value == null) return null;
            return GetAll(model.Value.Values, type);
        }

        public List<Value> GetAll(Value value, ValueType type)
        {
            if (value == null) return null;
            return GetAll(value.Values, type);
        }

        public List<Value> GetAll(List<Value> values, ValueType type)
        {
            if (values == null) return new List<Value>();
            return values.Where(v => v.Type == type).ToList();
        }

        /* Dispaly */
        public string Display(GenericViewModel vm, string label)
        {
            Value value = Get(vm, label);
            return Display(value);
        }

        public string Display(Value value, string label)
        {
            Value displayValue = Get(value, label);
            return Display(displayValue);
        }

        public string Display(List<Value> values, string label)
        {
            Value value = Get(values, label);
            return Display(value);
        }

        public string Display(GenericViewModel vm)
        {
            if (vm == null) return "";
            return Display(vm.Value);
        }

        public string Display(Value value)
        {
            if (value == null) return "";

            if (value.Type == ValueType.IntValue)
                return value.Int.ToString();

            if (value.Type == ValueType.SerializedStringValue)
                return value.SerializedString;

            return value.String;
        }

        /* Render */
        public async Task Render(GenericViewModel vm, string label)
        {
            Value value = Get(vm, label);
            await Render(value, vm.Options);
        }

        public async Task Render(List<Value> values, string label, RenderOption options = RenderOption.Display)
        {
            Value value = Get(values, label);
            await Render(value, options);
        }

        public async Task Render(Value value, string label, RenderOption options = RenderOption.Display)
        {
            Value renderValue = Get(value, label);
            await Render(renderValue, options);
        }

        public async Task Render(Value value, RenderOption options = RenderOption.Display)
        {
            await Render(new GenericViewModel { Value = value, Options = options });
        }

        public async Task Render(GenericViewModel vm)
        {
            if (vm.Value == null)
            {
                return;
            }
            string template = GetTemplate(vm.Value, vm.Options);
            await Html.RenderPartialAsync(template, vm);
        }

        /* Render list */
        public async Task RenderList(List<Value> values, RenderOption options = RenderOption.Display)
        {
            if (values == null) return;

            foreach (Value value in values)
            {
                await Render(value, options);
            }
        }

        public async Task RenderList(GenericViewModel vm)
        {
            if (vm == null || vm.Value == null) return;
            await RenderList(vm.Value.Values, vm.Options);
        }

        /* Merge */
        public void MergeEditorValues(Value source, Value target)
        {
            if (target == null || source == null || source.RelatedValue == null || source.RelatedValue.Values == null)
                return;

            MergeEditorValues(source.RelatedValue, GetAll(target, "Attribute"));
        }

        private void MergeEditorValues(Value source, List<Value> targets)
        {
            List<Value> valueTargets = GetAll(targets, ValueType.RelatedAttribute);

            foreach (Value target in valueTargets)
            {
                if (source.AttributeId == target.RelatedAttribute.Id)
                {
                    target.RelatedValue = source;

                    if (source.Values == null || target.Values == null)
                        continue;

                    foreach (Value sourceChild in source.Values)
                    {
                        MergeEditorValues(sourceChild, target.Values);
                    }
                }
            }
        }

        private string GetTemplate(Value value, RenderOption option = RenderOption.Display)
        {
            string Location = "/Views/Shared/";
            string Option = "Templates/";
            string FileType = ".cshtml";

            Value template = Get(value, "Template");
            if (template != null)
            {
                return Location + Option + template.String + FileType;
            }

            string label = value.Attribute.Label.ToLower();
            if (TemplateAttributes.Contains(label))
            {
                return Location + Option + label + FileType;
            }

            return Location + Option + "default" + FileType;
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
