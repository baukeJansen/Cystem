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
        public Layouts CurrentLayout { get; set; } = Layouts.None;
        public Layouts Layout { get; set; } = Layouts.None;
        public string Url { get; set; }
    }
}
