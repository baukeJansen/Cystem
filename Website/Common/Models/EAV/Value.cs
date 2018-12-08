using System.ComponentModel.DataAnnotations.Schema;
using Website.Common.Enums;

namespace Website.Common.Models.EAV
{
    public class Value : Model
    {
        public int AttributeId { get; set; }

        [ForeignKey("AttributeId")]
        public Attribute Attribute { get; set; }

        public int? EntityId { get; set; }

        [ForeignKey("EntityId")]
        public Entity Entity { get; set; }

        public int? ValueId { get; set; }

        [ForeignKey("ValueId")]
        public Value Val { get; set; }
    }
}
