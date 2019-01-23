using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.BL.LL.ValueLL;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.DAL;
using ValueType = Website.Common.Enums.ValueType;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.BL.SL.CystemSL
{
    public class CystemService : Service<BasicViewModel>, ICystemService
    {
        private readonly IValueLogic valueLogic;

        public CystemService(DataContext context, IMapper mapper, IValueLogic valueLogic) : base(context, mapper)
        {
            this.valueLogic = valueLogic;
        }

        public override BasicViewModel Create(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override Task Delete(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override Task<BasicViewModel> Get(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override void Store(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public async Task<GenericViewModel> PreviewDelete(GenericViewModel viewModel)
        {
            if (viewModel.Id != 0)
            {
                Value value = new Value
                {
                    Id = viewModel.Id
                };

                Value preview = await valueLogic.PreviewDelete(value);

                Value page = new Value {
                    Type = ValueType.StringValue,
                    Attribute = new Attribute { Label = "Url" },
                    String = "",
                    Values = new List<Value> {
                        new Value
                        {
                            Type = ValueType.StringValue,
                            Attribute = new Attribute { Label = "Template" },
                            String = "delete-details"
                        },
                        new Value
                        {
                            Type = ValueType.RelatedValue,
                            Attribute = new Attribute {Label = "ToDelete" },
                            RelatedValue = preview
                        }
                    }
                };

                viewModel.Value = page;
            }

            return viewModel;
        }
    }
}
