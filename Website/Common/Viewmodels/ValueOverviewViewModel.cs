using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV;

namespace Website.Common.Viewmodels
{
    public class ValueOverviewViewModel : ActionViewModel
    {
        public List<Value> Values { get; set; }
    }
}
