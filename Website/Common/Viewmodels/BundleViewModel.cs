using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Viewmodels
{
    public class BundleViewModel : ActionViewModel
    {
        public List<string> Actions { get; set; } = new List<string>();
        public List<PartialViewResult> Results { get; set; }
        //public List<RouteValueDictionary> RouteValuesList { get; set; }
    }
}
