using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.IO;

namespace Website.Common.Extensions
{
    public static class JsonExtensions
    {
        public static string Serialize(this object obj)
        {
            using (var stringWriter = new StringWriter())
            using (var jsonWriter = new JsonTextWriter(stringWriter))
            {
                var serializer = new JsonSerializer
                {
                    // Let's use camelCasing as is common practice in JavaScript
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };

                // We don't want quotes around object names
                jsonWriter.QuoteName = true;
                jsonWriter.StringEscapeHandling = StringEscapeHandling.EscapeHtml;
                serializer.Serialize(jsonWriter, obj);
                string json = stringWriter.ToString();
                string escaped = json.Replace("\"", "\\\"");
                return json;
            }
        }
    }
}
