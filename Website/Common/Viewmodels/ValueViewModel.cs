using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using Website.Common.Enums;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Common.Viewmodels
{
    public class ValueViewModel : ActionViewModel
    {
        public SelectList Types { get; set; }
        public ValueType Type { get; set; } = ValueType.None;
        public int Order { get; set; }
        public int GroupId { get; set; }
        public int? ParentId { get; set; }
        public int Int { get; set; }
        public string String { get; set; }
        public string SerializedString { get; set; }
        public DateTime? DateTime { get; set; }
    }
}
