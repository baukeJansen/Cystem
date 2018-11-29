using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;

namespace Website.DAL
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        { }

        public DbSet<Page> Pages { get; set; }
        public DbSet<Template> Templates { get; set; }

        public DbSet<Daily> Daily { get; set; }
        public DbSet<LayingPercentage> LayingPercentages { get; set; }
        //public DbSet<DailyEgg> DailyEggs { get; set; }
        //public DbSet<DeadChicken> DeadChickens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Daily>()
                .HasIndex(e => new { e.Date });
        }
    }
}
