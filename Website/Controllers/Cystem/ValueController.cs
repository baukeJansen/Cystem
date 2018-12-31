using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using Website.Common.Extensions;
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
        public IActionResult SortedOverview(ValueOverviewViewModel vm)
        {
            List<Value> values = context.Values.Include(v => v.Attribute).ToList();
            List<Value> parentValues = values.Where(v => v.GroupId == null).ToList();
            /*List<Value> sortedValues = new List<Value>();

            foreach(Value value in values)
            {
                if (value.GroupId == null)
                {
                    sortedValues.Add(value);
                }
                else
                {
                    Value parent = values.Find(v => v.Id == value.GroupId);

                    if (parent.Values == null) parent.Values = new List<Value>();

                    parent.Values.Add(value);
                }
            }*/

            vm.Values = parentValues;

            return View(vm);
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
            return View("Edit", vm);
        }

        [HttpPost]
        public IActionResult Store(ValueViewModel vm)
        {
            if (vm.Id == 0)
            {
                Value value = mapper.Map<Value>(vm);
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
            Value value = new Value { Id = vm.Id };
            context.Values.Remove(value);
            context.SaveChanges();

            return Ok();
        }

        [HttpGet]
        public IActionResult Debug()
        {
            //service.Test();
            return View("Overview");
        }

        public static SelectList GetValueTypes(ValueType _default = ValueType.None)
        {
            List<SelectListItem> valueTypeOptions = new List<SelectListItem>();

            foreach (ValueType value in @EnumHelper<ValueType>.GetValues(ValueType.None))
            {

                valueTypeOptions.Add(new SelectListItem
                {
                    Text = value.Name(),
                    Value = value.ToString()
                });
            }

            return new SelectList(valueTypeOptions, "Value", "Text", _default);
        }
    }
}
