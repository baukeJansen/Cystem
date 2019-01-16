using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.ViewComponents;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Views.HtmlHelpers
{
    public partial class RenderHelper : IRenderHelper, IViewContextAware
    {
        private ViewContext viewContext;
        private readonly IValueHelper valueHelper;
        private readonly IViewComponentHelper componentHelper;

        public RenderHelper(IValueHelper valueHelper, IViewComponentHelper componentHelper)
        {
            this.valueHelper = valueHelper;
            this.componentHelper = componentHelper;
        }

        public async Task<IHtmlContent> Value(GenericViewModel vm, string label)
        {
            Value value = valueHelper.Get(vm, label);
            return await Value(value, vm.Options);
        }

        public async Task<IHtmlContent> Value(List<Value> values, string label, DisplaySetting options = DisplaySetting.Render)
        {
            Value value = valueHelper.Get(values, label);
            return await Value(value, options);
        }
        public async Task<IHtmlContent> Value(Value value, string label, DisplaySetting options = DisplaySetting.Render)
        {
            Value renderValue = valueHelper.Get(value, label);
            return await Value(renderValue, options);
        }

        public async Task<IHtmlContent> Value(GenericViewModel vm, ValueType type)
        {
            Value value = valueHelper.Get(vm, type);
            return await Value(value, vm.Options);
        }

        public async Task<IHtmlContent> Value(List<Value> values, ValueType type, DisplaySetting options = DisplaySetting.Render)
        {
            Value value = valueHelper.Get(values, type);
            return await Value(value, options);
        }

        public async Task<IHtmlContent> Value(Value value, ValueType type, DisplaySetting options = DisplaySetting.Render)
        {
            Value renderValue = valueHelper.Get(value, type);
            return await Value(renderValue, options);
        }

        public async Task<IHtmlContent> Value(Value value, DisplaySetting options = DisplaySetting.Render)
        {
            if (value == null) return new HtmlString("");
            return await Value(new GenericViewModel { Value = value, Options = options });
        }

        public async Task<IHtmlContent> Value(GenericViewModel vm, DisplaySetting options)
        {
            return await Value(new GenericViewModel { Value = vm.Value, Options = options });
        }

        public async Task<IHtmlContent> Value(GenericViewModel vm)
        {
            if (vm == null) return new HtmlString("");
            return await componentHelper.InvokeAsync(typeof(RenderViewComponent), vm);
        }


        public async Task<IHtmlContent> Values(GenericViewModel vm, string label)
        {
            List<Value> values = valueHelper.GetAll(vm, label);
            return await Values(values, vm.Options);
        }

        public async Task<IHtmlContent> Values(GenericViewModel vm)
        {
            return await Values(vm?.Value?.Values, vm.Options);
        }

        public async Task<IHtmlContent> Values(Value value, DisplaySetting options = DisplaySetting.Render)
        {
            return await Values(value?.Values, options);
        }

        public async Task<IHtmlContent> Values(List<Value> values, DisplaySetting options = DisplaySetting.Render)
        {
            if (values == null) return new HtmlString("");

            IHtmlContentBuilder builder = new HtmlContentBuilder();

            foreach (Value value in values)
            {
                GenericViewModel vm = new GenericViewModel { Value = value, Options = options };
                Type t = typeof(RenderViewComponent);
                builder.AppendHtml(await componentHelper.InvokeAsync(t, vm));
            }

            return builder;
        }

        void IViewContextAware.Contextualize(ViewContext viewContext)
        {
            this.viewContext = viewContext;

            if (componentHelper is IViewContextAware)
            {
                ((IViewContextAware)componentHelper).Contextualize(viewContext);
            }
        }
    }
}
