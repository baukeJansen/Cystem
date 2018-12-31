using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Enums
{
    public enum EggType
    {
        [Display(Description = "Normaal")]
        Standard,
        [Display(Description = "2e soort")]
        SecondKind,
        [Display(Description = "Verkoop")]
        Sale,
        [Display(Description = "Anders")]
        Other
    }
}
