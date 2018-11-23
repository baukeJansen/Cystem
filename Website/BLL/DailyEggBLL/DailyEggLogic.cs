using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using Website.BLL.DailyTotalBLL;
using Website.Common.Data;
using Website.Common.Data.Chart;
using Website.Common.Enums;
using Website.Common.Extensions;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BLL.DailyEggBLL
{
    public class DailyEggLogic : Logic, IDailyEggLogic
    {
        private const int EGGS_PER_PALLET = 10800;
        private const int EGGS_PER_LAYER = 2160;
        private const int EGGS_PER_STACK = 180;
        private const int EGGS_PER_TRAY = 30;

        private readonly DataContext context;
        private readonly IDailyTotalLogic dailyTotalLogic;

        public DailyEggLogic(DataContext context, IDailyTotalLogic dailyTotalLogic)
        {
            this.context = context;
            this.dailyTotalLogic = dailyTotalLogic;
        }

        public DailyEggOverviewViewModel GetOverview()
        {
            List<DailyEgg> dailyEggs = context.DailyEggs.OrderBy(l => l.Date).ToList();
            /*List<EggsPerDay> eggDays = new List<EggsPerDay>();

            dailyEggs.ForEach(l =>
                eggDays.Add(new EggsPerDay
                {
                    Date = l.Day.ToString("yyyy-MM-dd"),
                    Type = EnumHelper<ExportType>.GetDisplayValue(l.ExportType),
                    Eggs = l.Eggs,
                    EmptyAfterRun = l.EmptyAfterRun
                })
            );

            string serializedDailyEggs = eggDays.Serialize();*/

            string serializedDailyEggs = GetEggData(dailyEggs).Serialize();

            return new DailyEggOverviewViewModel
            {
                Models = dailyEggs,
                SerializedDailyEggs = serializedDailyEggs
            };
        }

        public DailyEggViewModel Create()
        {
            return new DailyEggViewModel {
                Model = new DailyEgg(),
                ExportTypes = GetExportTypes()
            };
        }

        public DailyEggViewModel Get(int id)
        {
            DailyEgg model = context.DailyEggs.Find(id);

            if (model == null) throw new NullReferenceException();

            DailyEggViewModel viewModel = new DailyEggViewModel
            {
                Model = model,
                Eggs = new EggStaples(),
                ExportTypes = GetExportTypes(model.ExportType)
            };

            viewModel.Eggs = EggsToPallets(model, viewModel.Eggs);

            return viewModel;
        }

        public DailyEggViewModel Store(DailyEggViewModel viewModel)
        {
            if (viewModel.EggInputType == EggInputType.Stacks)
            {
                viewModel.Model.Eggs = PalletsToEggs(viewModel.Eggs);
            }

            if (viewModel.Model.Id == 0) {
                context.DailyEggs.Add(viewModel.Model);
            }
            else
            {
                context.DailyEggs.Update(viewModel.Model);
            }
            context.SaveChanges();

            dailyTotalLogic.UpdateTotal(viewModel.Model.Date);

            return viewModel;
        }

        public void Delete(int id)
        {
            DailyEgg model = new DailyEgg { Id = id };
            Delete(model);
        }

        public void Delete(DailyEggViewModel viewModel)
        {
            Delete(viewModel.Model);
        }

        public void Delete(DailyEgg model)
        {
            if (model != null) {
                context.DailyEggs.Remove(model);
                context.SaveChanges();
            }
        }

        public SelectList GetExportTypes(ExportType def = ExportType.Standard)
        {
            List<SelectListItem> exportTypeOptions = new List<SelectListItem>();
            foreach (var value in @EnumHelper<ExportType>.GetValues(ExportType.Standard))
            {
                exportTypeOptions.Add(new SelectListItem
                {
                    Text = EnumHelper<ExportType>.GetDisplayValue(value),
                    Value = value.ToString()
                });
            }

            return new SelectList(exportTypeOptions, "Value", "Text", def);
        }

        public int PalletsToEggs(EggStaples staple)
        {
            return ((staple.Pallets * EGGS_PER_PALLET) + (staple.Layers * EGGS_PER_LAYER) + (staple.Stacks * EGGS_PER_STACK) + (staple.Trays * EGGS_PER_TRAY));
        }

        public EggStaples EggsToPallets(DailyEgg model, EggStaples staple)
        {
            return EggsToPallets(model.Eggs, staple);
        }

        public EggStaples EggsToPallets(int eggs)
        {
            return EggsToPallets(eggs, new EggStaples());
        }

        public EggStaples EggsToPallets(int eggs, EggStaples staple)
        {
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

        public DataSet GetEggData(List<DailyEgg> models)
        {
            return new DataSet {
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
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == ExportType.Standard).ToList();
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
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == ExportType.SecondKind).ToList();
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
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == ExportType.Sale).ToList();
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
            List<DailyEgg> standardEggsModels = models.Where(m => m.ExportType == ExportType.Other).ToList();
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

        public int GetEggsForDate(DateTime date)
        {
            return context.DailyEggs.Where(d => d.Date == date).Sum(d => d.Eggs);
        }
    }
}
