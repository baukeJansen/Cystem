using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;
using Website.Views.HtmlHelpers;

namespace Website.Controllers.Cystem
{
    [Area("Cystem")]
    public class GroupController : BaseController<GroupViewModel>
    {
        private readonly DataContext context;
        private readonly IMapper mapper;

        public GroupController(DataContext context, IMapper mapper, IValueHelper valueHelper) : base(valueHelper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        public IActionResult Overview(GroupOverviewViewModel vm)
        {
            vm.Groups = context.Groups.ToList();
            return View("Overview", vm);
        }

        [HttpGet]
        public IActionResult Create(GroupViewModel vm)
        {
            vm.Types = ValueController.GetValueTypes();
            return View("Edit", vm);
        }

        [HttpGet]
        public IActionResult Edit(GroupViewModel vm)
        {
            Group model = context.Groups.Find(vm.Id);
            mapper.Map(model, vm);
            vm.Types = ValueController.GetValueTypes();
            return View("Edit", vm);
        }

        [HttpPost]
        public IActionResult Store(GroupViewModel vm)
        {
            if (vm.Id == 0)
            {
                Group model = new Group();

                model = mapper.Map(vm, model);
                context.Groups.Add(model);
            }
            else
            {
                Group model = context.Groups.Find(vm.Id);
                model = mapper.Map(vm, model);
                context.Update(model);
            }

            context.SaveChanges();
            return Ok();
        }

        [HttpDelete]
        public IActionResult Delete(GroupViewModel vm)
        {
            context.Remove(new Group { Id = vm.Id });
            context.SaveChanges();
            return Ok();
        }
    }
}
