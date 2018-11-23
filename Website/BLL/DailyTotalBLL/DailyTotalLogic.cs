using System;
using System.Linq;
using Website.BLL.DailyEggBLL;
using Website.BLL.DeadChickenBLL;
using Website.Common.Models;
using Website.DAL;

namespace Website.BLL.DailyTotalBLL
{
    public class DailyTotalLogic : Logic, IDailyTotalLogic
    {
        private readonly DataContext context;
        private readonly IDailyEggLogic dailyEggLogic;
        private readonly IDeadChickenLogic deadChickenLogic;

        public DailyTotalLogic(DataContext context, IDailyEggLogic dailyEggLogic, IDeadChickenLogic deadChickenLogic)
        {
            this.context = context;
            this.dailyEggLogic = dailyEggLogic;
            this.deadChickenLogic = deadChickenLogic;
        }

        public DailyTotal GetTotalWithChickenCount(DateTime date)
        {
            return context.DailyTotals.Where(d => d.Date < date && d.ChickenCount > 0).OrderByDescending(d => d.Date).FirstOrDefault();
        }
    }
}
