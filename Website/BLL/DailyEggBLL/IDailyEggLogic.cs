using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BLL.DailyEggBLL
{
    public interface IDailyEggLogic
    {
        DailyEggOverviewViewModel GetOverview();

        DailyEggViewModel Create();

        DailyEggViewModel Get(int id);

        DailyEggViewModel Store(DailyEggViewModel viewModel);

        void Delete(int id);

        void Delete(DailyEggViewModel viewModel);

        SelectList GetExportTypes(ExportType def = ExportType.Standard);

        int GetEggsForDate(DateTime date);
    }
}
