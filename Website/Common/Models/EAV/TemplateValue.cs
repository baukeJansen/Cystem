using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV.EAVInterfaces;

namespace Website.Common.Models.EAV
{
    public class TemplateValue : GroupValue, IStringValue
    {
        public string String { get; set; }

        [NotMapped]
        public string TemplateName {
            get => String;
            set => String = value;
        }
    }
}
