﻿using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Website.BL.LL.ValueLL;
using Website.BL.QL.ValueQL;
using Website.BL.SL.CystemSL;
using Website.BL.SL.DatatableSL;
using Website.BL.SL.RouterSL;
using Website.DAL;
using Website.Views.HtmlHelpers;

namespace Website
{
    public static class ServiceRegister
    {
        public static IServiceCollection AddCustomServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Database
            services.AddDbContext<DataContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DataContext"))
            );

            // Query
            services.AddScoped<IValueQuery, ValueQuery>();

            // Logic
            services.AddScoped<IValueLogic, ValueLogic>();

            // Service
            services.AddScoped<ICystemService, CystemService>();
            services.AddScoped<IRouterService, RouterService>();
            services.AddScoped<IDatatableService, DatatableService>();

            // Helper
            services.AddTransient<ICystemHelper, CystemHelper>();
            services.AddTransient<IValueHelper, ValueHelper>();
            services.AddTransient<IGroupHelper, GroupHelper>();
            services.AddTransient<IRenderHelper, RenderHelper>();
        
            // Singleton - Only one instance is ever created and returned.
            // services.AddSingleton<IExampleService, ExampleService>();

            // Scoped - A new instance is created and returned for each request/response cycle.
            // services.AddScoped<IExampleService, ExampleService>();

            // Transient - A new instance is created and returned each time.
            // services.AddTransient<IExampleService, ExampleService>();

            return services;
        }

        /// <summary>
        /// Configures the anti-forgery tokens for better security. See:
        /// http://www.asp.net/mvc/overview/security/xsrfcsrf-prevention-in-aspnet-mvc-and-web-pages
        /// </summary>
        /// <param name="services">The services collection or IoC container.</param>
        public static IServiceCollection AddAntiforgerySecurely(this IServiceCollection services) =>
            services.AddAntiforgery(
                options =>
                {
                    // Rename the Anti-Forgery cookie from "__RequestVerificationToken" to "f". This adds a little
                    // security through obscurity and also saves sending a few characters over the wire.
                    options.Cookie.Name = "f";

                    // Rename the form input name from "__RequestVerificationToken" to "f" for the same reason above
                    // e.g. <input name="__RequestVerificationToken" type="hidden" value="..." />
                    options.FormFieldName = "f";

                    // Rename the Anti-Forgery HTTP header from RequestVerificationToken to X-XSRF-TOKEN. X-XSRF-TOKEN
                    // is not a standard but a common name given to this HTTP header popularized by Angular.
                    options.HeaderName = "X-XSRF-TOKEN";
                });

        /// <summary>
        /// Configures caching for the application. Registers the <see cref="IDistrbutedCache"/> and
        /// <see cref="IMemoryCache"/> types with the services collection or IoC container. The
        /// <see cref="IDistrbutedCache"/> is intended to be used in cloud hosted scenarios where there is a shared
        /// cache, which is shared between multiple instances of the application. Use the <see cref="IMemoryCache"/>
        /// otherwise.
        /// </summary>
        /// <param name="services">The services collection or IoC container.</param>
        public static IServiceCollection AddCaching(this IServiceCollection services) =>
            services
                // Adds IMemoryCache which is a simple in-memory cache.
                .AddMemoryCache()
                // Adds IDistributedCache which is a distributed cache shared between multiple servers. This adds a
                // default implementation of IDistributedCache which is not distributed. See below:
                .AddDistributedMemoryCache();
        // Uncomment the following line to use the Redis implementation of IDistributedCache. This will
        // override any previously registered IDistributedCache service.
        // Redis is a very fast cache provider and the recommended distributed cache provider.
        // .AddDistributedRedisCache(
        //     options =>
        //     {
        //     });
        // Uncomment the following line to use the Microsoft SQL Server implementation of IDistributedCache.
        // Note that this would require setting up the session state database.
        // Redis is the preferred cache implementation but you can use SQL Server if you don't have an alternative.
        // .AddSqlServerCache(
        //     x =>
        //     {
        //         x.ConnectionString = "Server=.;Database=ASPNET5SessionState;Trusted_Connection=True;";
        //         x.SchemaName = "dbo";
        //         x.TableName = "Sessions";
        //     });

        /// <summary>
        /// Configures the settings by binding the contents of the config.json file to the specified Plain Old CLR
        /// Objects (POCO) and adding <see cref="IOptionsSnapshot{}"/> objects to the services collection.
        /// </summary>
        /// <param name="services">The services collection or IoC container.</param>
        /// <param name="configuration">Gets or sets the application configuration, where key value pair settings are
        /// stored.</param>
        public static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration configuration) =>
            services;
    }
}
