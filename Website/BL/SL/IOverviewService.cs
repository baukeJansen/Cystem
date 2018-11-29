using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.BL.SL
{
    public interface IOverviewService<TOverviewViewModel>
    {
        TOverviewViewModel GetOverview(TOverviewViewModel vm);
    }
}
