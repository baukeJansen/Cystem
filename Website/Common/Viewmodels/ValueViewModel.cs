using Microsoft.AspNetCore.Mvc.Rendering;
using Website.Common.Enums;

namespace Website.Common.Viewmodels
{
    public class ValueViewModel : ActionViewModel
    {
        public SelectList Types { get; set; }
        public ValueType Type { get; set; } = ValueType.None;
        public int AttributeId { get; set; }
        public int? GroupId { get; set; }
        public int Int { get; set; }
        public string String { get; set; }
        public string SerializedString { get; set; }
    }
}
