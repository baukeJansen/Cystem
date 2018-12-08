using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Website.Common.Models.EAV;

namespace Website.Common.Models
{
    public class Entity : Model
    {
        [InverseProperty("Entity")]
        public List<Value> Values { get; set; }
    }
}
