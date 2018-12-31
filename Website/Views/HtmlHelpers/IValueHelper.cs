using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Views.HtmlHelpers
{
    public interface IValueHelper
    {
        Value Get(GenericViewModel model, string label);
        Value Get(List<Value> values, string label);
        Value Get(Value value, string label);
        Value Get(GenericViewModel model, ValueType type);
        Value Get(List<Value> values, ValueType type);
        Value Get(Value value, ValueType type);

        List<Value> GetAll(GenericViewModel values, string label);
        List<Value> GetAll(List<Value> values, string label);
        List<Value> GetAll(Value values, string label);
        List<Value> GetAll(GenericViewModel values, ValueType type);
        List<Value> GetAll(List<Value> values, ValueType type);
        List<Value> GetAll(Value values, ValueType type);

        string Display(GenericViewModel vm, string label);
        string Display(List<Value> values, string label);
        string Display(Value value, string label);
        string Display(GenericViewModel value);
        string Display(Value value);

        Task Render(GenericViewModel vm, string label);
        Task Render(List<Value> values, string label, RenderOption options = RenderOption.Display);
        Task Render(Value value, string label, RenderOption options = RenderOption.Display);
        Task Render(GenericViewModel vm);
        Task Render(Value value, RenderOption options = RenderOption.Display);

        Task RenderList(GenericViewModel vm);
        Task RenderList(List<Value> values, RenderOption options = RenderOption.Display);

        void MergeEditorValues(Value source, Value target);
    }
}
