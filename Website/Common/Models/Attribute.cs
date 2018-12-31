using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Website.Common.Enums;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Common.Models.EAV
{
    public class Attribute : Model
    {
        public ValueType Type { get; set; }

        public string Label { get; set; }

        [InverseProperty("Attribute")]
        public List<Value> Values { get; set; }
    }
}
