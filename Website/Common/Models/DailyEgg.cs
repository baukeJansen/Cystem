using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Enums;

namespace Website.Common.Models
{
    public class DailyEgg : Model
    {
        [Required]
        [Display(Name = "Datum")]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime Date { get; set; } = DateTime.Now;

        [Required]
        [Display(Name = "Eieren")]
        public int Eggs { get; set; }

        [Required]
        [Display(Name = "Export type")]
        public ExportType ExportType { get; set; } = ExportType.Standard;

        [Display(Name = "Leeg na afdraaien")]
        public bool EmptyAfterRun { get; set; } = false;

        [Display(Name = "Opmerkingen")]
        [DataType(DataType.MultilineText)]
        public string Remarks { get; set; }
    }
}
