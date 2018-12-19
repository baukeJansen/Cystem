﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;

namespace Website.Common.Models.EAV
{
    public class StringValue : Value, IStringValue
    {
        public string String { get; set; }
    }
}