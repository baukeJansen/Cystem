using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Data
{
    public class EggStaples
    {
        [Display(Name = "Pallets")]
        public int Pallets { get; set; }
        [Display(Name = "Lagen")]
        public int Layers { get; set; }
        [Display(Name = "Stapels")]
        public int Stacks { get; set; }
        [Display(Name = "Trays")]
        public int Trays { get; set; }
    }
}
