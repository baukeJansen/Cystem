using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;

namespace Website.Common.Models.EAV
{
    public class GroupValue : Value
    {
        [InverseProperty("Val")]
        public List<Value> Values { get; set; }
    }
}
