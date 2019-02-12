using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Enums
{
    public enum ValueType
    {
        [Display(Name = "Onbekend")]
        None = 0,
        [Display(Name = "Int")]
        IntValue = 1,
        [Display(Name = "String")]
        StringValue = 2,
        [Display(Name = "Serialized")]
        SerializedStringValue = 8,
        [Display(Name = "Group")]
        GroupValue = 3,
        [Display(Name = "Related")]
        RelatedValue = 4,
        [Display(Name = "Attribuut")]
        RelatedAttribute = 6,
        [Display(Name = "Param")]
        ParamValue = 7,
        [Display(Name = "Date")]
        DateValue = 9
    }
}
