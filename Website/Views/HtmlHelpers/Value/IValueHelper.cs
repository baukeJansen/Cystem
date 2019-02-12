using System.Collections.Generic;
using Website.Common.Models;
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

        void Add(GenericViewModel model, Value childValue);
        void Add(Value value, Value childValue);

        string Display(GenericViewModel vm, string label);
        string Display(List<Value> values, string label);
        string Display(Value value, string label);
        string Display(GenericViewModel value);
        string Display(Value value);

        void MergeEditorValues(Value source, Value target);
        void SetModelSource(Value model, Value source);

        void Remove(GenericViewModel model, string label);
        void Remove(Value remove, string label);
        void Remove(GenericViewModel model, Value remove);
        void Remove(Value value, Value remove);
        void Remove(List<Value> values, Value remove);
    }
}
