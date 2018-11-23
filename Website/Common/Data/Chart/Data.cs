using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Data.Chart
{
    public class Data
    {
        public string[] label { get; set; }
        public List<object> data { get; set; }
        public string backgroundColor { get; set; }
        public string borderColor { get; set; }
        public bool fill { get; set; }
        public string pointBackgroundColor { get; set; }
        public int borderWidth { get; set; }
    }
}
