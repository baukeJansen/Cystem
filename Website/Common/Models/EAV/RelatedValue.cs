using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV.EAVInterfaces;

namespace Website.Common.Models.EAV
{
    public class RelatedValue : Value, IIntValue
    {
        public int Int { get; set; }

        [NotMapped]
        public int RelatedId { get => Int; set => Int = value; }

        [NotMapped]
        public Value Related { get; set; }
    }
}
