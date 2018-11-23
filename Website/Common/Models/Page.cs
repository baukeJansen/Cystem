using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Models
{
    public class Page : Model
    {
        public string Url { get; set; }

        public int TemplateId { get; set; }
        [ForeignKey("TemplateId")]
        public Template Template { get; set; }
    }
}
