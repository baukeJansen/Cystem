using System.Collections.Generic;
using Website.Common.Models;

namespace Website.Common.Data
{
    public class QueryResult
    {
        public List<Value> Values { get; set; } = new List<Value>();
        public List<Group> Groups { get; set; } = new List<Group>();
    }
}
