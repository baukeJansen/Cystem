﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Exceptions
{
    public class InvalidTemplateException : Exception
    {
        public InvalidTemplateException() : base("Template was not found")
        {

        }
    }
}
