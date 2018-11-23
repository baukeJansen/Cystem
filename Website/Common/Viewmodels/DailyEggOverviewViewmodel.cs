using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;

namespace Website.Common.Viewmodels
{
    public class DailyEggOverviewViewModel : ViewModel
    {
        public List<DailyEgg> Models { get; set; }
        public string SerializedDailyEggs { get; set; }
    }
}
