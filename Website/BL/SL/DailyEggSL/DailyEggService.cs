using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using Website.BL.LL.DailyLL;
using Website.Common.Data;
using Website.Common.Enums;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BL.SL.DailyEggSL
{
    public class DailyEggService : Service<DailyEggViewModel>, IDailyEggService
    {
        private readonly IDailyLogic logic;

        public DailyEggService(DataContext context, IMapper mapper, IDailyLogic logic) : base(context, mapper)
        {
            this.logic = logic;
        }

        public override DailyEggViewModel Get(DailyEggViewModel viewModel)
        {
            Daily model = context.Daily.Find(viewModel.Id);
            if (model == null) throw new NullReferenceException();

            viewModel = mapper.Map(model, viewModel);

            switch (viewModel.ExportType)
            {
                case EggType.Standard: viewModel.Eggs = model.NormalEggs; break;
                case EggType.SecondKind: viewModel.Eggs = model.SecondKindEggs; break;
                case EggType.Sale: viewModel.Eggs = model.SaleEggs; break;
                case EggType.Other: viewModel.Eggs = model.OtherEggs; break;
            }

            viewModel.ExportTypes = logic.GetExportTypes(viewModel.ExportType);
            viewModel.EggStaples = logic.EggsToStaples(viewModel.Eggs);

            return viewModel;
        }

        public DailyEggOverviewViewModel GetOverview(DailyEggOverviewViewModel viewModel)
        {
            List<Daily> models = context.Daily.OrderBy(l => l.Date).ToList();
            List<DailyEggViewModel> viewModels = new List<DailyEggViewModel>();

            foreach (Daily model in models)
            {
                foreach (EggType type in Enum.GetValues(typeof(EggType)))
                {
                    DailyEggViewModel vm = mapper.Map<DailyEggViewModel>(model);
                    switch(type)
                    {
                        case EggType.Standard: vm.Eggs = model.NormalEggs; break;
                        case EggType.SecondKind: vm.Eggs = model.SecondKindEggs; break;
                        case EggType.Sale: vm.Eggs = model.SaleEggs; break;
                        case EggType.Other: vm.Eggs = model.OtherEggs; break;
                    }
                    vm.ExportType = type;

                    if (vm.Eggs != 0)
                    {
                        viewModels.Add(vm);
                    }
                }
            }

            
            string serializedDailyEggs = ""; // GetEggData(dailyEggs).Serialize();

            viewModel.Data = viewModels;
            viewModel.SerializedData = serializedDailyEggs;

            return viewModel;
        }


        public override DailyEggViewModel Create(DailyEggViewModel viewModel)
        {
            viewModel.EggStaples = new EggStaples();
            viewModel.ExportTypes = logic.GetExportTypes();

            return viewModel;
        }

        public override void Store(DailyEggViewModel viewModel)
        {
            Daily model;

            if (viewModel.EggInputType == EggInputType.Stacks)
            {
                viewModel.Eggs = logic.StaplesToEggs(viewModel.EggStaples);
            }

            if (viewModel.Id == 0)
            {
                model = context.Daily.Where(d => d.Date == viewModel.Date).FirstOrDefault();

                if (model == null)
                {
                    model = new Daily();
                    model = mapper.Map(viewModel, model);
                    context.Daily.Add(model);
                }
                else
                {
                    viewModel.Id = model.Id;
                    model = mapper.Map(viewModel, model);
                    context.Daily.Update(model);
                }
            }
            else
            {
                model = context.Daily.Find(viewModel.Id);
                model = mapper.Map(viewModel, model);
                context.Daily.Update(model);
            }

            switch(viewModel.ExportType)
            {
                case EggType.Standard: model.NormalEggs = viewModel.Eggs; break;
                case EggType.SecondKind: model.SecondKindEggs = viewModel.Eggs; break;
                case EggType.Sale: model.SaleEggs = viewModel.Eggs; break;
                case EggType.Other: model.OtherEggs = viewModel.Eggs; break;
            }

            logic.UpdateTotal(model);
            context.SaveChanges();
        }

        public override void Delete(DailyEggViewModel viewModel)
        {
            Daily model = new Daily { Id = viewModel.Id };

            if (model != null)
            {
                context.Daily.Remove(model);
                context.SaveChanges();
            }
        }
    }
}
