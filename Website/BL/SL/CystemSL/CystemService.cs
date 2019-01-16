using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;
using Website.DAL;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.BL.SL.CystemSL
{
    public class CystemService : Service<BasicViewModel>, ICystemService
    {
        public CystemService(DataContext context, IMapper mapper) : base(context, mapper)
        {
        }

        public override BasicViewModel Create(BasicViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override void Delete(BasicViewModel viewModel)
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

        public void Test()
        {
        }
    }
}
