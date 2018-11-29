using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.DAL;

namespace Website.BL.QL
{
    public abstract class Query <TModel> where TModel : Model
    {
        readonly DataContext context;

        public Query(DataContext context)
        {
            this.context = context;
        }

        public TModel Get(int id)
        {
            return context.Find<TModel>(id);
        }
    }
}
