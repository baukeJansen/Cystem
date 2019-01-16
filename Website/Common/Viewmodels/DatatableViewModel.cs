using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Viewmodels
{
    public class DatatableViewModel : ActionViewModel
    {
        public int ValueId { get; set; }
        public int Page { get; set; }
        public string SearchString { get; set; }
    }
}
