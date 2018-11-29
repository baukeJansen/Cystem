using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Viewmodels
{
    public class ActionViewModel : ViewModel
    {
        public bool JsPage { get; set; } = false;
        public bool Overlay { get; set; } = false;
        public string Url { get; set; }
    }
}
