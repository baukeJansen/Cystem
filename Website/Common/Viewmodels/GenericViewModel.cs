using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;
using Website.Common.Models.EAV;

namespace Website.Common.Viewmodels
{
    public class GenericViewModel : ActionViewModel
    {
        public PageValue Page { get; set; }
    }
}
