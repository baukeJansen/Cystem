using System.Collections.Generic;
using Website.Common.Models.EAV;
using Attribute = Website.Common.Models.EAV.Attribute;

namespace Website.Common.Data
{
    public class QueryResult
    {
        public List<Value> Values { get; set; } = new List<Value>();
        public List<Attribute> Attributes { get; set; } = new List<Attribute>();
    }
}
