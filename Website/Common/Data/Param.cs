using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Website.Common.Data
{
    public static class Param<TValue>
    {
        public static TValue Any { get => default(TValue); }
    }
}
