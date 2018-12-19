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
            public DbSet<IntValue> IntValues { get; set; }
            public DbSet<StringValue> StringValues { get; set; }
            public DbSet<GroupValue> GroupValues { get; set; }
            public DbSet<TemplateValue> TemplateValues { get; set; }
            public DbSet<PageValue> PageValues { get; set; }

        public DbSet<Daily> Daily { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            /* Int values */
            modelBuilder.Entity<IntValue>()
                .Property(i => i.Int)
                .HasColumnName("Int");

            /* String values */ 
            modelBuilder.Entity<StringValue>()
                .Property(s => s.String)
                .HasColumnName("String");

            modelBuilder.Entity<TemplateValue>()
                .Property(t => t.String)
                .HasColumnName("String");

            /* Serialized string values */
            modelBuilder.Entity<PageValue>()
                .Property(p => p.SerializedString)
                .HasColumnName("SerializedString");

            /* Indexes */
            modelBuilder.Entity<Value>()
                .HasIndex(v => v.AttributeId);

            modelBuilder.Entity<PageValue>()
                .HasIndex(p => p.SerializedString);


        }
    }
}
