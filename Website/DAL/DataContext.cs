using Microsoft.EntityFrameworkCore;
using Website.Common.Models;
using Website.Common.Models.EAV;

namespace Website.DAL
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        { }
        public DbSet<Attribute> Attributes { get; set; }

        public DbSet<Value> Values { get; set; }

        public DbSet<Daily> Daily { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            /* Indexes */
            modelBuilder.Entity<Value>()
                .HasIndex(v => v.AttributeId);

            modelBuilder.Entity<Value>()
                .HasIndex(p => p.SerializedString);
        }
    }
}
