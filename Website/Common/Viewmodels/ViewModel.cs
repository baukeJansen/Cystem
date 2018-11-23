using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Viewmodels
{
    public abstract class ViewModel
    {
        public bool JsPage { get; set; } = false;
        public bool Overlay { get; set; } = false;
        public string Url { get; set; }
    }
}
