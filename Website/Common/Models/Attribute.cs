using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Models.EAV
{
    public class Attribute : Model
    {
        public string Label { get; set; }

        [InverseProperty("Attribute")]
        public List<Value> Values { get; set; }
    }
}
