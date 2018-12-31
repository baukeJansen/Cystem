using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Website.Common.Enums;
using static System.Net.WebRequestMethods;

namespace Website.Common.Viewmodels
{
    public class ActionViewModel : ViewModel
    {
        public Layout CurrentLayout { get; set; } = Layout.None;
        public Layout Layout { get; set; } = Layout.None;
        public bool Overlay { get; set; } = false;
        public string Url { get; set; }
    }
}
