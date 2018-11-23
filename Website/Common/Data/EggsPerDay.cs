using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Data
{
    public class EggsPerDay
    {
        public string Date { get; set; }
        public string Type { get; set; }
        public int Eggs { get; set; }
        public bool EmptyAfterRun { get; set; }
    }
}
