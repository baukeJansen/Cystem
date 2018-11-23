using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;

namespace Website.Common.Viewmodels
{
    public class DeadChickenOverviewViewModel : ViewModel
    {
        public List<DeadChicken> DeadChickens { get; set; }
        public string SerializedData { get; set; }
    }
}
