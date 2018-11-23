using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Common.Models
{
    public class DailyTotal : Model
    {
        [Required]
        [Display(Name = "Datum")]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime Date { get; set; }

        [Required]
        [Display(Name = "Eieren")]
        public int EggCount { get; set; }
        public int ChickenCount { get; set; }
        public int Average { get; set; }
    }
}
