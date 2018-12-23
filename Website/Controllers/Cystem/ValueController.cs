using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.DAL;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")] 
    public class ValueController : JsActionController<ValueViewModel>
    {
        private readonly DataContext context;
        private readonly IMapper mapper;

        public ValueController(DataContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        public IActionResult Overview(ValueOverviewViewModel vm)
        {
            vm.Values = context.Values.Include(v => v.Attribute).ToList();
            return View("Overview", vm);
        }

        [HttpGet]
        public IActionResult Create(ValueViewModel vm)
        {
            vm.Types = GetValueTypes();
            return View("Edit", vm);
        }

        [HttpGet]
        public IActionResult Edit(ValueViewModel vm)
        {
            Value value = context.Values.Find(vm.Id);
            mapper.Map(value, vm);
            vm.Types = GetValueTypes(vm.Type);
            vm.Type = GetValueType(value);
            return View("Edit", vm);
        }

        [HttpPost]
        public IActionResult Store(ValueViewModel vm)
        {
            if (vm.Id == 0)
            {
                Value value;

                switch (vm.Type)
                {
                    case ValueType.IntValue: value = new IntValue(); break;
                    case ValueType.StringValue: value = new StringValue(); break;
                    case ValueType.GroupValue: value = new GroupValue(); break;
                    case ValueType.RelatedValue: value = new RelatedValue(); break;
                    case ValueType.TemplateValue: value = new TemplateValue(); break;
                    case ValueType.PageValue: value = new PageValue(); break;
                    case ValueType.None: throw new Exception("No type selected for value");
                    default: throw new Exception("Invalid value type");
                }

                value = mapper.Map(vm, value);
                context.Values.Add(value);
            }
            else
            {
                Value value = context.Values.Find(vm.Id);
                value = mapper.Map(vm, value);
                context.Update(value);
            }

            context.SaveChanges();
            return Ok();
        }

        [HttpDelete]
        public IActionResult Delete(ValueViewModel vm)
        {
            return Ok();
        }

        [HttpGet]
        public IActionResult Debug()
        {
            //service.Test();
            return View("Overview");
        }

        public SelectList GetValueTypes(ValueType _default = ValueType.None)
        {
            List<SelectListItem> valueTypeOptions = new List<SelectListItem>();

            foreach (var value in @EnumHelper<ValueType>.GetValues(ValueType.None))
            {
                valueTypeOptions.Add(new SelectListItem
                {
                    Text = EnumHelper<ValueType>.GetDisplayValue(value),
                    Value = value.ToString()
                });
            }

            return new SelectList(valueTypeOptions, "Value", "Text", _default);
        }

        public ValueType GetValueType(Value value)
        {
            Type type = value.GetType();
            if (type == typeof(IntValue)) return ValueType.IntValue;
            if (type == typeof(StringValue)) return ValueType.StringValue;
            if (type == typeof(GroupValue)) return ValueType.GroupValue;
            if (type == typeof(TemplateValue)) return ValueType.TemplateValue;
            if (type == typeof(PageValue)) return ValueType.PageValue;
            return ValueType.None;
        }
    }
}
