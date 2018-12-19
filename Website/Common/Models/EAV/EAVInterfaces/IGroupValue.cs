using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Models.EAV
{
    public interface IGroupValue
    {
        [InverseProperty("Group")]
        List<Value> Values { get; set; }
    }
}
