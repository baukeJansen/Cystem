using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using Website.BL.LL.EavLL;
using Website.BL.LL.PageLL;
using Website.Common.Enums;
using Website.Common.Exceptions;
using Website.Common.Models;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BL.SL.RouterSL
{
    public class RouterService : Service<GenericViewModel>, IRouterService
    {
        private readonly IPageLogic pageLogic;
        private readonly IEavLogic eavLogic;

        public RouterService(DataContext context, IMapper mapper, IPageLogic pageLogic, IEavLogic eavLogic) : base(context, mapper) {
            this.pageLogic = pageLogic;
            this.eavLogic = eavLogic;
        }

        public override GenericViewModel Create(GenericViewModel viewModel)
        {
            return new GenericViewModel
            {
                Values = new List<Value>()
            };
        }

        public override GenericViewModel Get(GenericViewModel viewModel)
        {
            Page page = pageLogic.Get(viewModel.Url);

            if (page == null)
            {
                throw new InvalidPageException();
            }

            mapper.Map(page, viewModel);
            return viewModel;
        }

        public string GetTemplate(GenericViewModel vm)
        {
            int templateId = vm.Values.Where(v => v.AttributeId == DefaultAttributes.TemplateAttribute).Select(v => v.Id).FirstOrDefault();

            if (templateId == 0)
            {
                throw new InvalidTemplateException();
            }

            return "/Views/Shared/Templates/Template" + templateId + ".cshtml";
        }

        public override void Store(GenericViewModel viewModel)
        {
            eavLogic.Store(viewModel.Values);
        }

        public override void Delete(GenericViewModel viewModel)
        {
            eavLogic.Delete(viewModel.Values);

            Entity entity = new Entity { Id = viewModel.Id };
            context.Remove(entity);
        }
    }
}
