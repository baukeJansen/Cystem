using System.ComponentModel.DataAnnotations.Schema;
using Website.Common.Enums;

namespace Website.Common.Models.EAV
{
    public class Value : Model
    {
        public int AttributeId { get; set; }

        [ForeignKey("AttributeId")]
        public Attribute Attribute { get; set; }

        public int? GroupId { get; set; }

        [ForeignKey("GroupId")]
        public Value Group { get; set; }
    }
}
