using Microsoft.AspNetCore.Mvc.Rendering;
using Website.Common.Enums;

namespace Website.Common.Viewmodels
{
    public class GroupViewModel : ActionViewModel
    {
        public ValueType Type { get; set; }
        public SelectList Types { get; set; }
        public string Label { get; set; }
    }
}
