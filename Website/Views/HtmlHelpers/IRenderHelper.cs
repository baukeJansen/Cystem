using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Views.HtmlHelpers
{
    public interface IRenderHelper : IViewContextAware
    {
        /* Render value */
        Task<IHtmlContent> Value(GenericViewModel vm, string label);
        Task<IHtmlContent> Value(List<Value> values, string label, DisplaySetting options = DisplaySetting.Render);
        Task<IHtmlContent> Value(Value value, string label, DisplaySetting options = DisplaySetting.Render);

        Task<IHtmlContent> Value(GenericViewModel vm, ValueType type);
        Task<IHtmlContent> Value(List<Value> values, ValueType type, DisplaySetting options = DisplaySetting.Render);
        Task<IHtmlContent> Value(Value value, ValueType type, DisplaySetting options = DisplaySetting.Render);

        Task<IHtmlContent> Value(Value value, DisplaySetting options = DisplaySetting.Render);
        Task<IHtmlContent> Value(GenericViewModel vm, DisplaySetting options);
        Task<IHtmlContent> Value(GenericViewModel vm);

        /* Render values */
        Task<IHtmlContent> Values(GenericViewModel vm, string label);

        Task<IHtmlContent> Values(GenericViewModel vm);
        Task<IHtmlContent> Values(Value value, DisplaySetting options = DisplaySetting.Render);
        Task<IHtmlContent> Values(List<Value> values, DisplaySetting options = DisplaySetting.Render);

        /* Buttons */
        Task<IHtmlContent> SimpleButton(string url, string buttonText, DisplaySetting options, object routeValues = null, ElementAction action = ElementAction.Display, object htmlAttributes = null);
        Task<IHtmlContent> IconButton(string url, string icon, object routeValues = null, DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Display, object htmlAttributes = null);
        Task<IHtmlContent> FloatingButton(string url, string icon, object routeValues = null, DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null);
        Task<IHtmlContent> CreateButton(string url, object routeValues = null, string buttonText = "New", string icon = "add", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null);
        Task<IHtmlContent> EditButton(string url, object routeValues = null, string buttonText = "Edit", string icon = "edit", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null);
        Task<IHtmlContent> SubmitButton(string buttonText = "Submit", string icon = "send", ElementAction action = ElementAction.Close, string classes = "", object htmlAttributes = null);
        Task<IHtmlContent> DeleteButton(string url, object routeValues = null, string buttonText = "Delete", string icon = "delete", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Close, object htmlAttributes = null);
        Task<IHtmlContent> DeleteModalButton(string url, object routeValues = null, string buttonText = "Delete", string icon = "delete", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Close, object htmlAttributes = null);
        Task<IHtmlContent> SelectButton(string url, string buttonText, object routeValues = null, string icon = "arrow_forward", DisplaySetting options = DisplaySetting.Render, ElementAction action = ElementAction.Overlay, object htmlAttributes = null);
    }
}
