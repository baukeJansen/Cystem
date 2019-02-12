using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using ValueType = Website.Common.Enums.ValueType;

namespace Website.Common.Models
{
    public class Value : Model 
    {
        public ValueType Type { get; set; }

        public int GroupId { get; set; }

        [ForeignKey("GroupId")]
        public Group Group { get; set; }

        public int? ParentId { get; set; }

        [ForeignKey("ParentId")]
        public Value Parent { get; set; }

        [InverseProperty("Parent")]
        public List<Value> Values { get; set; }

        [NotMapped]
        public Value RelatedValue { get; set; }

        [NotMapped]
        public Group RelatedGroup { get; set; }

        public int? Int { get; set; }

        public string String { get; set; }

        public string SerializedString { get; set; }

        public DateTime? DateTime { get; set; }

        public int Order { get; set; }

        public int Permission { get; set; }
    }
}
