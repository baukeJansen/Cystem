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
        None,
        [Display(Name = "Int")]
        IntValue,
        [Display(Name = "String")]
        StringValue,
        [Display(Name = "Groep")]
        GroupValue,
        [Display(Name = "Gerelateerd")]
        RelatedValue,
        [Display(Name = "Template")]
        TemplateValue,
        [Display(Name = "Pagina")]
        PageValue
    }
}
