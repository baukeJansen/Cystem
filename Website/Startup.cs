using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Net.Http.Headers;
using System;
using System.IO.Compression;
using System.Linq;
using WebMarkupMin.AspNetCore2;
using Website.DAL;
using Website.Settings;

namespace Website
{
    public class Startup
    {
        public readonly IConfiguration configuration;

        public Startup(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Policy
            /*services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = Microsoft.AspNetCore.Http.SameSiteMode.None;
            });*/

            services
                .AddAntiforgerySecurely()

                .AddCaching()

                .AddOptions(configuration)

                .AddRouting(options =>
                {
                    // Improve SEO by stopping duplicate URL's due to case differences or trailing slashes.
                    // See http://googlewebmastercentral.blogspot.co.uk/2010/04/to-slash-or-not-to-slash.html
                    // All generated URL's should append a trailing slash.
                    options.AppendTrailingSlash = true;
                    // All generated URL's should be lower-case.
                    options.LowercaseUrls = true;
                })

                .AddResponseCaching()

                // Add response compression to enable GZIP compression.
                .AddResponseCompression(options =>
                {
                    options.Providers.Add<GzipCompressionProvider>();

                    // Add additional MIME types (other than the built in defaults) to enable GZIP compression for.
                    var responseCompressionSettings = new ResponseCompressionSettings();
                    configuration.GetSection(nameof(ResponseCompressionSettings)).Bind(responseCompressionSettings);

                    options.MimeTypes = ResponseCompressionDefaults
                        .MimeTypes
                        .Concat(responseCompressionSettings.MimeTypes);
                })

                .Configure<GzipCompressionProviderOptions>(
                    options => options.Level = CompressionLevel.Optimal)

                // Add useful interface for accessing the ActionContext outside a controller.
                .AddSingleton<IActionContextAccessor, ActionContextAccessor>()

                // Add useful interface for accessing the HttpContext outside a controller.
                .AddSingleton<IHttpContextAccessor, HttpContextAccessor>()

                // Add useful interface for accessing the IUrlHelper outside a controller.
                .AddScoped<IUrlHelper>(x => x
                    .GetRequiredService<IUrlHelperFactory>()
                    .GetUrlHelper(x.GetRequiredService<IActionContextAccessor>().ActionContext))

                // Adds a filter which help improve search engine optimization (SEO).
                //.AddSingleton<RedirectToCanonicalUrlAttribute>()

                // Mvc
                .AddMvc()
                    .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                    .AddTypedRouting()
                .Services

                .Configure<RazorViewEngineOptions>(o =>
                {
                    o.AreaViewLocationFormats.Clear();
                    o.AreaViewLocationFormats.Add("/Views/{2}/{1}/{0}" + RazorViewEngine.ViewExtension);
                    o.AreaViewLocationFormats.Add("/Views/Shared/{0}" + RazorViewEngine.ViewExtension);
                })

                // Minification
                .AddWebMarkupMin(options =>
                {
                    options.AllowMinificationInDevelopmentEnvironment = false;
                })
                .AddHtmlMinification(options =>
                {
                    options.MinificationSettings.RemoveRedundantAttributes = true;
                    options.MinificationSettings.RemoveHttpProtocolFromAttributes = true;
                    options.MinificationSettings.RemoveHttpsProtocolFromAttributes = true;
                });

                // Add custom services
                services.AddCustomServices(configuration)
                .BuildServiceProvider();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                //app.UseHsts(); Force Https
            }

            app.UseResponseCompression();
            //app.UseHttpsRedirection();
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    const int durationInSeconds = 60 * 60 * 24;
                    ctx.Context.Response.Headers[HeaderNames.CacheControl] = "public,max-age=" + durationInSeconds;
                    ctx.Context.Response.Headers[HeaderNames.Vary] = "Accept-Encoding";
                }
            });
            //app.UseCookiePolicy();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "Cystem areas",
                    template: "{area:exists}/{controller}/{action}",
                    defaults: new { controller = "Cystem", action="Index" }
                );

                routes.MapRoute(
                    name: "Cystem",
                    template: "Cystem/{action}",
                    defaults: new { controller = "Cystem", action = "Index" }
                );

                routes.MapRoute(
                    "Routing",
                    "{*.}",
                    new { controller = "Router", action = "Route" }
                );
            });
        }
    }
}
