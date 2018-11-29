using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.BL.LL.DailyLL;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BL.SL.DeadChickenSL
{
    public class DeadChickenService : Service<DeadChickenViewModel>, IDeadChickenService
    {
        private readonly IDailyLogic logic;

        public DeadChickenService(DataContext context, IMapper mapper, IDailyLogic logic) : base(context, mapper)
        {
            this.logic = logic;
        }

        public override DeadChickenViewModel Get(DeadChickenViewModel viewModel)
        {
            Daily model = context.Daily.Find(viewModel.Id);

            if (model == null) throw new NullReferenceException();

            mapper.Map(model, viewModel);

            return viewModel;
        }

        public DeadChickenOverviewViewModel GetOverview(DeadChickenOverviewViewModel viewModel)
        {
            List<Daily> models = context.Daily.OrderBy(d => d.Date).ToList();
            List<DeadChickenViewModel> viewModels = new List<DeadChickenViewModel>();

            viewModels = mapper.Map(models, viewModels);

            viewModel.Data = viewModels;
            viewModel.SerializedData = "";
            return viewModel;
        }
   
        public override DeadChickenViewModel Create(DeadChickenViewModel viewModel)
        {
            return viewModel;
        }

        public override void Store(DeadChickenViewModel viewModel)
        {
            Daily model;

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

                model = mapper.Map <Daily>(viewModel);
                context.Daily.Add(model);
            }
            else
            {
                model = context.Daily.Find(viewModel.Id);
                model = mapper.Map(viewModel, model);
                context.Daily.Update(model);
            }

            model.DeadChickens += viewModel.Amount;
            logic.UpdateTotal(model);

            context.SaveChanges();
        }

        public override void Delete(DeadChickenViewModel viewModel)
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
