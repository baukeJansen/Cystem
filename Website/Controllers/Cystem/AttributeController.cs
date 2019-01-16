using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.DAL;
using Website.Views.HtmlHelpers;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")]
    public class AttributeController : JsActionController<AttributeViewModel>
    {
        private readonly DataContext context;
        private readonly IMapper mapper;

        public AttributeController(DataContext context, IMapper mapper, IValueHelper valueHelper) : base(valueHelper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        public IActionResult Overview(AttributeOverviewViewModel vm)
        {
            vm.Attributes = context.Attributes.ToList();
            return View("Overview", vm);
        }

        [HttpGet]
        public IActionResult Create(AttributeViewModel vm)
        {
            vm.Types = ValueController.GetValueTypes();
            return View("Edit", vm);
        }

        [HttpGet]
        public IActionResult Edit(AttributeViewModel vm)
        {
            Attribute model = context.Attributes.Find(vm.Id);
            mapper.Map(model, vm);
            vm.Types = ValueController.GetValueTypes();
            return View("Edit", vm);
        }

        [HttpPost]
        public IActionResult Store(AttributeViewModel vm)
        {
            if (vm.Id == 0)
            {
                Attribute model = new Attribute();

                model = mapper.Map(vm, model);
                context.Attributes.Add(model);
            }
            else
            {
                Attribute model = context.Attributes.Find(vm.Id);
                model = mapper.Map(vm, model);
                context.Update(model);
            }

            context.SaveChanges();
            return Ok();
        }

        [HttpDelete]
        public IActionResult Delete(AttributeViewModel vm)
        {
            context.Remove(new Attribute { Id = vm.Id });
            context.SaveChanges();
            return Ok();
        }
    }
}
