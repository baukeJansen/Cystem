using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using Website.Common.Data;
using Website.Common.Data.Chart;
using Website.Common.Enums;
using Website.Common.Models;
using Website.DAL;

namespace Website.BL.LL.DailyLL
{
    public class DailyLogic : Logic, IDailyLogic
    {
        private const int EGGS_PER_PALLET = 10800;
        private const int EGGS_PER_LAYER = 2160;
        private const int EGGS_PER_STACK = 180;
        private const int EGGS_PER_TRAY = 30;

        private readonly DataContext context;

        public DailyLogic(DataContext context)
        {
            this.context = context;
        }

        public int StaplesToEggs(EggStaples staple)
        {
            return ((staple.Pallets * EGGS_PER_PALLET) + (staple.Layers * EGGS_PER_LAYER) + (staple.Stacks * EGGS_PER_STACK) + (staple.Trays * EGGS_PER_TRAY));
        }

        public EggStaples EggsToStaples(int eggs)
        {
            EggStaples staple = new EggStaples();

            int eggCount = eggs;
            staple.Pallets = eggCount / EGGS_PER_PALLET;
            eggCount = eggCount % EGGS_PER_PALLET;
            staple.Layers = eggCount / EGGS_PER_LAYER;
            eggCount = eggCount % EGGS_PER_LAYER;
            staple.Stacks = eggCount / EGGS_PER_STACK;
            eggCount = eggCount % EGGS_PER_STACK;
            staple.Trays = eggCount / EGGS_PER_TRAY;
            eggCount = eggCount % EGGS_PER_TRAY;

            return staple;
        }

        public SelectList GetExportTypes(EggType _default = EggType.Standard)
        {
            List<SelectListItem> exportTypeOptions = new List<SelectListItem>();
            foreach (var value in @EnumHelper<EggType>.GetValues(EggType.Standard))
            {
                exportTypeOptions.Add(new SelectListItem
                {
                    Text = EnumHelper<EggType>.GetDisplayValue(value),
                    Value = value.ToString()
                });
            }

            return new SelectList(exportTypeOptions, "Value", "Text", _default);
        }

        public void UpdateTotal(DateTime date)
        {
            Daily model = context.Daily.Where(d => d.Date == date).FirstOrDefault();
            if (model == null)
            {
                model = new Daily { Date = date };
            }

            UpdateTotal(model);
        }

        public void UpdateTotal(Daily model)
        {
            if (model == null)
            {
                throw new NullReferenceException();
            }

            //Daily previous = context.Daily.Where(d => d.Date < model.Date).OrderByDescending(d => d.Date).FirstOrDefault();
            //if (previous == null) { throw new Exception("No previous data"); }

            //model.TotalEggs = model.NormalEggs + model.SecondKindEggs + model.SaleEggs + model.OtherEggs;
            //model.TotalChickens = previous.TotalChickens - model.DeadChickens;

            //if (model.)
        }

        public void UpdateConsecutivly(Daily model)
        {
            List<Daily> consecutiveItems = context.Daily.Where(d => d.Date > model.Date).ToList();
            if (consecutiveItems.Count == 0) return;

            int totalChickens = model.TotalChickens;

            consecutiveItems.ForEach(d => {
                d.TotalChickens = totalChickens - d.DeadChickens;
                totalChickens = d.TotalChickens;
            });

            context.UpdateRange(consecutiveItems);
        }

        // ## Serialize data ## //
        public DataSet GetEggData(List<DailyEgg> models)
        {
            return new DataSet
            {
                datasets = new List<Data>
                {
                    GetStandardEggData(models),
                    GetSecondKindEggData(models),
                    GetSaleEggData(models),
                    GetOtherEggData(models),
                    GetTotalEggData(models)
                }
            };
        }

        public Data GetStandardEggData(List<DailyEgg> models)
        {
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == EggType.Standard).ToList();
            List<object> data = new List<object>();

            standardEggsModels.ForEach(m => {
                data.Add(new { x = m.Date.ToString("dd MMM yyyy"), y = m.Eggs });
            });

            return new Data
            {
                backgroundColor = "rgba(63,147,62,.3)",
                borderColor = "#3f933e",
                borderWidth = 1,
                fill = true,
                label = new[] { "Normaal" },
                pointBackgroundColor = "#616161",
                data = data
            };
        }

        public Data GetSecondKindEggData(List<DailyEgg> models)
        {
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == EggType.SecondKind).ToList();
            List<object> data = new List<object>();

            standardEggsModels.ForEach(m => {
                data.Add(new { x = m.Date.ToString("dd MMM yyyy"), y = m.Eggs });
            });

            return new Data
            {
                backgroundColor = "rgba(244,67,54,.3)",
                borderColor = "#f44336",
                borderWidth = 1,
                fill = true,
                label = new[] { "2e soort" },
                pointBackgroundColor = "#616161",
                data = data
            };
        }

        public Data GetSaleEggData(List<DailyEgg> models)
        {
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == EggType.Sale).ToList();
            List<object> data = new List<object>();

            standardEggsModels.ForEach(m => {
                data.Add(new { x = m.Date.ToString("dd MMM yyyy"), y = m.Eggs });
            });

            return new Data
            {
                backgroundColor = "rgba(255,228,25,.3)",
                borderColor = "#ffe419",
                borderWidth = 1,
                fill = true,
                label = new[] { "Verkoop" },
                pointBackgroundColor = "#616161",
                data = data
            };
        }

        public Data GetOtherEggData(List<DailyEgg> models)
        {
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == EggType.Other).ToList();
            List<object> data = new List<object>();

            standardEggsModels.ForEach(m => {
                data.Add(new { x = m.Date.ToString("dd MMM yyyy"), y = m.Eggs });
            });

            return new Data
            {
                backgroundColor = "rgba(26,117,207,.3)",
                borderColor = "#1976D2",
                borderWidth = 1,
                fill = true,
                label = new[] { "Anders" },
                pointBackgroundColor = "#616161",
                data = data
            };
        }

        public Data GetTotalEggData(List<DailyEgg> models)
        {
            List<object> data = new List<object>();
            int eggs = -1;
            DateTime date = new DateTime(1, 1, 1);
            models.ForEach(m => {
                if (date.Date == m.Date.Date)
                {
                    eggs += m.Eggs;
                }
                else
                {
                    if (eggs != -1)
                    {
                        data.Add(new { x = date.ToString("dd MMM yyyy"), y = eggs });
                    }

                    eggs = m.Eggs;
                    date = m.Date;
                }
            });

            data.Add(new { x = date.ToString("dd MMM yyyy"), y = eggs });

            return new Data
            {
                backgroundColor = "rgba(255,255,255,.3)",
                borderColor = "#fff",
                borderWidth = 1,
                fill = true,
                label = new[] { "Total" },
                pointBackgroundColor = "#616161",
                data = data
            };
        }


        /*(public int GetDeadChickensForDate(DateTime date)
        {
            return context.Total.Where(d => d.Date == date).Sum(d => d.Amount);
        }

        public int GetDeadChickensForDate(DateTime startDate, DateTime endDate)
        {
            return context.DeadChickens.Where(d => d.Date > startDate && d.Date <= endDate).Sum(d => d.Amount);
        }*/
    }
}
