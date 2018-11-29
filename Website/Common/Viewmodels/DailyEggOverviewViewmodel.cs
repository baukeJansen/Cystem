using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;

namespace Website.Common.Viewmodels
{
    public class DailyEggOverviewViewModel : ActionViewModel
    {
        public List<DailyEggViewModel> Data { get; set; }
        public string SerializedData { get; set; }
    }
}
