﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Website.DAL;

namespace Website.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20181208143303_eav-test5")]
    partial class eavtest5
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.4-rtm-31024")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Website.Common.Models.Daily", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("AverageEggs");

                    b.Property<DateTime>("Date");

                    b.Property<int>("DeadChickens");

                    b.Property<int>("NormalEggs");

                    b.Property<int>("OtherEggs");

                    b.Property<int>("SaleEggs");

                    b.Property<int>("SecondKindEggs");

                    b.Property<int>("TotalChickens");

                    b.Property<int>("TotalEggs");

                    b.HasKey("Id");

                    b.ToTable("Daily");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.Attribute", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Label");

                    b.HasKey("Id");

                    b.ToTable("Attributes");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.Value", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("AttributeId");

                    b.Property<string>("Discriminator")
                        .IsRequired();

                    b.Property<int?>("GroupId");

                    b.Property<int?>("GroupValueId");

                    b.Property<int?>("TemplateValueId");

                    b.HasKey("Id");

                    b.HasIndex("AttributeId");

                    b.HasIndex("GroupId");

                    b.HasIndex("GroupValueId");

                    b.HasIndex("TemplateValueId");

                    b.ToTable("Values");

                    b.HasDiscriminator<string>("Discriminator").HasValue("Value");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.GroupValue", b =>
                {
                    b.HasBaseType("Website.Common.Models.EAV.Value");


                    b.ToTable("GroupValue");

                    b.HasDiscriminator().HasValue("GroupValue");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.IntValue", b =>
                {
                    b.HasBaseType("Website.Common.Models.EAV.Value");

                    b.Property<int>("Int")
                        .HasColumnName("Int");

                    b.ToTable("IntValue");

                    b.HasDiscriminator().HasValue("IntValue");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.PageValue", b =>
                {
                    b.HasBaseType("Website.Common.Models.EAV.Value");

                    b.Property<string>("Url");

                    b.HasIndex("Url");

                    b.ToTable("PageValue");

                    b.HasDiscriminator().HasValue("PageValue");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.StringValue", b =>
                {
                    b.HasBaseType("Website.Common.Models.EAV.Value");

                    b.Property<string>("String")
                        .HasColumnName("String");

                    b.ToTable("StringValue");

                    b.HasDiscriminator().HasValue("StringValue");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.TemplateValue", b =>
                {
                    b.HasBaseType("Website.Common.Models.EAV.Value");

                    b.Property<int>("Int")
                        .HasColumnName("Int");

                    b.ToTable("TemplateValue");

                    b.HasDiscriminator().HasValue("TemplateValue");
                });

            modelBuilder.Entity("Website.Common.Models.EAV.Value", b =>
                {
                    b.HasOne("Website.Common.Models.EAV.Attribute", "Attribute")
                        .WithMany("Values")
                        .HasForeignKey("AttributeId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Website.Common.Models.EAV.PageValue", "Group")
                        .WithMany("Values")
                        .HasForeignKey("GroupId");

                    b.HasOne("Website.Common.Models.EAV.GroupValue")
                        .WithMany("Values")
                        .HasForeignKey("GroupValueId");

                    b.HasOne("Website.Common.Models.EAV.TemplateValue")
                        .WithMany("Values")
                        .HasForeignKey("TemplateValueId");
                });
#pragma warning restore 612, 618
        }
    }
}
