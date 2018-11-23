using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.Common.Viewmodels;
using Website.DAL;

namespace Website.BLL.DeadChickenBLL
{
    public class DeadChickenLogic : Logic, IDeadChickenLogic
    {
        private readonly DataContext context;

        public DeadChickenLogic(DataContext context)
        {
            this.context = context;
        }

        public DeadChickenOverviewViewModel GetOverview()
        {
            List<DeadChicken> deadChickens = context.DeadChickens.OrderBy(d => d.Date).ToList();

            return new DeadChickenOverviewViewModel
            {
                DeadChickens = deadChickens
            };
        }

        public DeadChickenViewModel Create()
        {
            return new DeadChickenViewModel
            {
                Model = new DeadChicken()
            };
        }
        
        public DeadChickenViewModel Get(int id)
        {
            DeadChicken model = context.DeadChickens.Find(id);

            if (model == null) throw new NullReferenceException();

            return new DeadChickenViewModel
            {
                Model = model
            };
        }

        public DeadChickenViewModel Store(DeadChickenViewModel viewModel)
        {
            if (viewModel.Model.Id == 0)
            {
                context.DeadChickens.Add(viewModel.Model);
            }
            else
            {
                context.DeadChickens.Update(viewModel.Model);
            }
            context.SaveChanges();

            return viewModel;
        }

        public void Delete(int id)
        {
            DeadChicken model = new DeadChicken { Id = id };
            Delete(model);
        }

        public void Delete(DeadChickenViewModel viewModel)
        {
            Delete(viewModel.Model);
        }

        public void Delete(DeadChicken model)
        {
            if (model != null)
            {
                context.DeadChickens.Remove(model);
                context.SaveChanges();
            }
        }

        public int GetDeadChickensForDate(DateTime date)
        {
            return context.DeadChickens.Where(d => d.Date == date).Sum(d => d.Amount);
        }

        public int GetDeadChickensForDate(DateTime startDate, DateTime endDate)
        {
            return context.DeadChickens.Where(d => d.Date > startDate && d.Date <= endDate).Sum(d => d.Amount);
        }
    }
}
