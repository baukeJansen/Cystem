using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Models
{
    public class Page : Entity
    {
        public string Url { get; set; }
    }
}
