using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.TagHelpers.Internal;
using Microsoft.AspNetCore.Mvc.Razor.Infrastructure;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace HtmlHelpers
{
    /// <summary>
    /// Source from https://gist.github.com/mohamedmansour/cd50123f8575daba7a7f12847b12da5d
    /// Adapted from https://github.com/madskristensen/BundlerMinifier/wiki/Unbundling-scripts-for-debugging
    /// 
    /// Areas modified:
    ///  - Modified it to make it work with aspnetcore.
    ///  - Accept both scripts and styles.
    ///  - Read config from wwwroot
    ///  - Accept baseFolder since DI not suited for static methods
    ///  - Style nitpicks
    /// </summary>
    public class Bundler
    {
        private const string VirtualFolder = "../wwwroot/";

        /// <summary>
        /// Unpacks the bundle (css/js) for debugging purposes. Makes the build faster by not bundling while debugging.
        /// </summary>
        /// <param name="baseFolder">The base folder for this application/</param>
        /// <param name="bundlePath">The bundled file to unpack.</param>
        /// <returns>Unpacked bundles</returns>
        public static HtmlString Unpack(string baseFolder, string bundlePath, HttpContext context)
        {
            // Cache busting -> append ?v={version} as querystring
            //IMemoryCache cache = context.RequestServices.GetRequiredService<IMemoryCache>();
            //var hostingEnvironment = context.RequestServices.GetRequiredService<IHostingEnvironment>();
            var versionProvider = context.RequestServices.GetRequiredService<IFileVersionProvider>();
            //var versionProvider = new FileVersionProvider (hostingEnvironment, cache);

            var configFile = Path.Combine(baseFolder, "bundleconfig.json");
            var bundle = GetBundle(configFile, bundlePath);
            if (bundle == null)
                return null;

            // Clean up the bundle to remove the virtual folder that aspnetcore provides.
            var inputFiles = bundle.InputFiles.Select(file => file.Substring(VirtualFolder.Length));

            var outputString = bundlePath.EndsWith(".js") ?
                inputFiles.Select(inputFile => $"<script src='{versionProvider.AddFileVersionToPath(new PathString(""), "/js/" + inputFile)}'></script>") :
                inputFiles.Select(inputFile => $"<link rel='stylesheet' href='{versionProvider.AddFileVersionToPath(new PathString(""), "/css/" + inputFile)}' />");

            return new HtmlString(string.Join("\n", outputString));
        }

        private static Bundle GetBundle(string configFile, string bundlePath)
        {
            var file = new FileInfo(configFile);
            if (!file.Exists)
                return null;

            var bundles = JsonConvert.DeserializeObject<IEnumerable<Bundle>>(File.ReadAllText(configFile));
            return (from b in bundles
                    where b.OutputFileName.EndsWith(bundlePath, StringComparison.OrdinalIgnoreCase)
                    select b).FirstOrDefault();
        }

        class Bundle
        {
            [JsonProperty("outputFileName")]
            public string OutputFileName { get; set; }

            [JsonProperty("inputFiles")]
            public List<string> InputFiles { get; set; } = new List<string>();
        }
    }
}