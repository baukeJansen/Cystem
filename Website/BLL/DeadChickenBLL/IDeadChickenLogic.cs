using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Viewmodels;

namespace Website.BLL.DeadChickenBLL
{
    public interface IDeadChickenLogic
    {
        DeadChickenOverviewViewModel GetOverview();

        DeadChickenViewModel Create();

        DeadChickenViewModel Get(int id);

        DeadChickenViewModel Store(DeadChickenViewModel viewModel);

        void Delete(int id);

        void Delete(DeadChickenViewModel viewModel);

        int GetDeadChickensForDate(DateTime date);

        int GetDeadChickensForDate(DateTime startDate, DateTime endDate);
    }
}
