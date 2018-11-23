using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.BLL.DailyEggBLL;
using Website.BLL.DailyTotalBLL;
using Website.BLL.DeadChickenBLL;
using Website.Common.Models;
using Website.DAL;

namespace Website.SL
{
    public class DailyTotalService : Service
    {
        private readonly DataContext context;
        private readonly IDailyTotalLogic logic;
        private readonly IDailyEggLogic dailyEggLogic;
        private readonly IDeadChickenLogic deadChickenLogic;

        public DailyTotalService(DataContext context, IDailyTotalLogic dailyTotalLogic, IDailyEggLogic dailyEggLogic, IDeadChickenLogic deadChickenLogic)
        {
            this.context = context;
            this.logic = dailyTotalLogic;
            this.dailyEggLogic = dailyEggLogic;
            this.deadChickenLogic = deadChickenLogic;
        }
        public void UpdateTotal(DateTime date)
        {
            DailyTotal total = context.DailyTotals.Where(d => d.Date == date).FirstOrDefault();

            if (total == null)
            {
                total = new DailyTotal
                {
                    Date = date
                };
            }

            total.EggCount = dailyEggLogic.GetEggsForDate(date);
            DailyTotal dailyTotal = b(date);
            if (dailyTotal == null)
            {
                dailyTotal = new DailyTotal { ChickenCount = 0, Date = new DateTime(2018, 1, 1) };
            }
            total.ChickenCount = dailyTotal.ChickenCount - deadChickenLogic.GetDeadChickensForDate(dailyTotal.Date, date);

            context.SaveChanges();
        }
    }
}
