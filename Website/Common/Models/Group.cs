using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Common.Models
{
    public class Group : Model
    {
        public ValueType Type { get; set; }

        public string Label { get; set; }

        [InverseProperty("Group")]
        public List<Value> Values { get; set; }
    }
}
