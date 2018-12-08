using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.DAL;

namespace Website.BL.LL.PageLL
{
    public class PageLogic : Logic, IPageLogic
    {
        private readonly DataContext context; 

        public PageLogic(DataContext context)
        {
            this.context = context;
        }

        public Page Get(int id)
        {
            return context.Pages.Where(p => p.Id == id)
                .Include(p => p.Values)
                    .ThenInclude(v => v.Attribute)
                .FirstOrDefault();
        }

        public Page Get(string url)
        {
            return context.Pages.Where(p => p.Url == url)
                .Include(p => p.Values)
                    .ThenInclude(v => v.Attribute)
                .FirstOrDefault();
        }
    }
}
