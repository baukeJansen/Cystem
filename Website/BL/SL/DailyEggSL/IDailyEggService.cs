﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Viewmodels;

namespace Website.BL.SL.DailyEggSL
{
    public interface IDailyEggService : IService<DailyEggViewModel>, IOverviewService<DailyEggOverviewViewModel>
    {
    }
}
