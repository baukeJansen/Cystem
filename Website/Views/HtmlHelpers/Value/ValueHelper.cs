using System.Collections.Generic;
using System.Linq;
using Website.Common.Models;
using Website.Common.Viewmodels;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Views.HtmlHelpers
{
    public class ValueHelper : IValueHelper
    {
        public const string TemplateLocation = "/Views/Templates/";
        public const string RenderPath = "Render/";
        public const string DisplayPath = "Display/";
        public const string EditPath = "Edit/";
        public const string AlterPath = "Alter/";
        public const string JsonPath = "Json/";
        public const string XmlPath = "Xml/";
        public const string FileType = ".cshtml";

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
            return values.Where(v => v.Group.Label == label).FirstOrDefault();
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
            return values.Where(v => v.Group.Label == label).ToList();
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

        /* Add */
        public void Add(GenericViewModel model, Value childValue)
        {
            if (model == null) return;

            Add(model.Value, childValue);
        }

        public void Add(Value value, Value childValue)
        {
            if (value == null) return;

            if (value.Values == null)
            {
                value.Values = new List<Value>();
            }

            value.Values.Add(childValue);
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

            switch(value.Type)
            {
                default:
                case ValueType.StringValue:
                    return value.String;

                case ValueType.SerializedStringValue:
                    return value.SerializedString;

                case ValueType.IntValue:
                    return value.Int.ToString();

                case ValueType.RelatedValue:
                    return value.Int.ToString();

                case ValueType.RelatedAttribute:
                    return value.Int.ToString();

                case ValueType.DateValue:
                    if (!value.DateTime.HasValue) return "";
                    return value.DateTime.Value.ToString("dd-MM-yyyy");
            }
        }

        /* New */
        public void CreateModel(Value model)
        {
            if (model == null || model.Values == null) return;

            CreateModel(model.Values);
        }

        public void CreateModel(List<Value> values)
        {
            if (values == null) return;

            foreach(Value value in values)
            {
                value.Id = 0;
                CreateModel(value.Values);
            }
        }


        /* Merge */
        public void MergeEditorValues(Value source, Value target)
        {
            if (target == null || source == null || source.RelatedValue == null)
                return;

            Value entry = Get(source.RelatedValue, "Modify entry");
            if (entry != null)
            {
                source.RelatedValue.Values.Remove(entry);
            }

            MergeEditorValues(source.RelatedValue, new List<Value> { target });
        }

        private void MergeEditorValues(Value source, List<Value> targets)
        {
            List<Value> valueTargets = GetAll(targets, ValueType.RelatedAttribute);

            foreach (Value target in valueTargets)
            {
                if (source.GroupId == target.RelatedGroup.Id)
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

        public void SetModelSource(Value model, Value source)
        {
            if (model == null || model.Values == null || source == null) return;

            SetModelSource(model.Values, source);
        }

        public void SetModelSource(List<Value> modelValues, Value source)
        {
            Value modelValue = modelValues.Where(v => v.GroupId == source.GroupId).FirstOrDefault();
            if (modelValue == null) return;

            modelValue.Id = source.Id;
            //modelValue.GroupId = source.GroupId;
            modelValue.Int = source.Int;
            modelValue.String = source.String;
            modelValue.SerializedString = source.SerializedString;
            modelValue.DateTime = source.DateTime;
            modelValue.Order = source.Order;
            modelValue.ParentId = source.ParentId;
            modelValue.Type = source.Type;

            if (modelValue.Values != null && source.Values != null)
            {
                foreach (Value value in source.Values)
                {
                    SetModelSource(modelValue.Values, value);
                }
            }
        }

        /* Remove */
        public void Remove(GenericViewModel model, string label)
        {
            if (model == null || model.Value == null) return;

            Value remove = Get(model, label);
            Remove(model.Value.Values, remove);
        }

        public void Remove(Value value, string label)
        {
            if (value == null) return;

            Value remove = Get(value, label);
            Remove(value.Values, remove);
        }

        public void Remove(GenericViewModel model, Value remove)
        {
            if (model == null || model.Value == null) return;

            Remove(model.Value.Values, remove);
        }

        public void Remove(Value value, Value remove)
        {
            if (value == null) return;

            Remove(value.Values, remove);
        }

        public void Remove(List<Value> values, Value remove)
        {
            if (values == null || remove == null) return;

            values.Remove(remove);
        }
    }
}
