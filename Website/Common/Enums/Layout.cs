using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Enums
{
    public enum Layout
    {
        [Display(Name = "None")]
        None,
        [Display(Name = "AjaxLayout")]
        AjaxLayout,
        [Display(Name = "CystemLayout")]
        CystemLayout,
        [Display(Name = "WebsiteLayout")]
        WebsiteLayout
    }
}
