using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Website.Common.Enums;

namespace Website.Common.Models.EAV
{
    public class Value : Model 
    {
        public ValueType Type { get; set; }

        public int AttributeId { get; set; }

        [ForeignKey("AttributeId")]
        public Attribute Attribute { get; set; }

        public int? GroupId { get; set; }

        [ForeignKey("GroupId")]
        public Value Group { get; set; }

        [InverseProperty("Group")]
        public List<Value> Values { get; set; }

        [NotMapped]
        public Value RelatedValue { get; set; }

        [NotMapped]
        public Attribute RelatedAttribute { get; set; }

        public int? Int { get; set; }

        public string String { get; set; }

        public string SerializedString { get; set; }
    }
}
