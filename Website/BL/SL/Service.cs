using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BL.SL
{
    public abstract class Service<TViewModel> : IService<TViewModel> where TViewModel : ViewModel
    {
        protected readonly DataContext context;
        protected readonly IMapper mapper;

        public Service(DataContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        public abstract Task<TViewModel> Get(TViewModel viewModel);
        public abstract TViewModel Create(TViewModel viewModel);
        public abstract void Store(TViewModel viewModel);
        public abstract Task Delete(TViewModel viewModel);
    }
}
