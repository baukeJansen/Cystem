using AutoMapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.BL.LL.ValueLL;
using Website.Common.Enums;
using Website.Common.Exceptions;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BL.SL.RouterSL
{
    public class RouterService : Service<GenericViewModel>, IRouterService
    {
        private readonly IValueLogic valueLogic;

        public RouterService(DataContext context, IMapper mapper, IValueLogic valueLogic) : base(context, mapper) {
            this.valueLogic = valueLogic;
        }

        public override GenericViewModel Create(GenericViewModel viewModel)
        {
            return new GenericViewModel
            {
                Value = new Value(),
                Options = DisplaySetting.Render
            };
        }

        public override async Task<GenericViewModel> Get(GenericViewModel viewModel)
        {
            Value value = await valueLogic.Get(viewModel.Url, viewModel.Id);
            viewModel.Value = value ?? throw new InvalidPageException();
            return viewModel;
        }

        public override void Store(GenericViewModel viewModel)
        {
            List<Value> values;
            if (viewModel.Value.GroupId != 0)
            {
                values = new List<Value> { viewModel.Value };
            }
            else
            {
                values = viewModel.Value.Values;
            }

            valueLogic.StoreRelated(values);
            context.SaveChanges();
        }

        public override async Task Delete(GenericViewModel viewModel)
        {
            if (viewModel.Id != 0)
            {
                Value value = new Value
                {
                    Id = viewModel.Id
                };

                await valueLogic.Delete(value);
                context.SaveChanges();
            }
        }
    }
}
