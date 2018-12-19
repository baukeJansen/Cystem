using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Viewmodels;

namespace Website.BL.SL
{
    public interface IService<TViewModel> where TViewModel : ViewModel
    {
        Task<TViewModel> Get(TViewModel viewModel);

        TViewModel Create(TViewModel viewModel);

        void Store(TViewModel viewModel);

        void Delete(TViewModel viewModel);
    }
}
