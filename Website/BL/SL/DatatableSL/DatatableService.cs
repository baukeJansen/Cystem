using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BL.SL.DatatableSL
{
    public class DatatableService : Service<DatatableViewModel>, IDatatableService
    {
        public DatatableService(DataContext context, IMapper mapper) : base(context, mapper)
        {
        }

        public override DatatableViewModel Create(DatatableViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override void Delete(DatatableViewModel viewModel)
        {
            throw new NotImplementedException();
        }

        public override Task<DatatableViewModel> Get(DatatableViewModel viewModel)
        {
            return Task.FromResult(viewModel);
        }

        public override void Store(DatatableViewModel viewModel)
        {
            throw new NotImplementedException();
        }
    }
}
