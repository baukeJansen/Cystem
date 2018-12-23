using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;
using Website.Common.Models.EAV.EAVInterfaces;

namespace Website.Common.Models.EAV
{
    public class IntValue : Value, IIntValue
    {
        public int Int { get; set; }
    }
}
