using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;

namespace Website.Common.Viewmodels
{
    public class DeadChickenOverviewViewModel : ActionViewModel
    {
        public List<DeadChickenViewModel> Data { get; set; }
        public string SerializedData { get; set; }
    }
}
