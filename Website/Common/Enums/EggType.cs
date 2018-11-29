using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Enums
{
    public enum EggType
    {
        [Display(Name = "Normaal")]
        Standard,
        [Display(Name = "2e soort")]
        SecondKind,
        [Display(Name = "Verkoop")]
        Sale,
        [Display(Name = "Anders")]
        Other
    }
}
