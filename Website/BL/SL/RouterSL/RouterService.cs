using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
                Value = new Value(),
                Options = RenderOption.Display
            };
        }

        public override async Task<GenericViewModel> Get(GenericViewModel viewModel)
        {
            Value value = await pageLogic.Get(viewModel.Url, viewModel.Id);
            viewModel.Value = value ?? throw new InvalidPageException();
            viewModel.Options = RenderOption.Display;
            return viewModel;
        }

        public override void Store(GenericViewModel viewModel)
        {
            List<Value> values;
            if (viewModel.Value.AttributeId != 0)
            {
                values = new List<Value> { viewModel.Value };
            }
            else
            {
                values = viewModel.Value.Values;
            }

            eavLogic.Store(values);
            context.SaveChanges();
        }

        public override void Delete(GenericViewModel viewModel)
        {
            eavLogic.Delete(viewModel.Value);
            context.SaveChanges();
        }
    }
}
