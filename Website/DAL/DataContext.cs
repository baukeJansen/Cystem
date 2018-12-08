using Microsoft.EntityFrameworkCore;
using Website.Common.Models;
using Website.Common.Models.EAV;

namespace Website.DAL
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        { }
        public DbSet<Entity> Entities { get; set; }
        public DbSet<Attribute> Attributes { get; set; }
        public DbSet<Value> Values { get; set; }
        public DbSet<IntValue> IntValues { get; set; }
        public DbSet<StringValue> StringValues { get; set; }
        public DbSet<GroupValue> GroupValues { get; set; }
        public DbSet<Page> Pages { get; set; }

        public DbSet<Daily> Daily { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Value>()
                .HasIndex(v => v.EntityId);

            modelBuilder.Entity<Value>()
                .HasIndex(v => v.AttributeId);

            modelBuilder.Entity<Page>()
                .HasIndex(p => p.Url);

            modelBuilder.Entity<Daily>()
                .HasIndex(e => e.Date);
        }
    }
}
