using System.Collections.Generic;
using Website.Common.Models;
using Website.Common.Models.EAV;

namespace Website.Common.Data
{
    public class QueryResult
    {
        public List<Value> Values { get; set; } = new List<Value>();
        public List<Group> Groups { get; set; } = new List<Group>();
    }
}
