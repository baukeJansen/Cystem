using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Common.Models
{
    public class DeadChicken : Model
    {
        [Required]
        [Display(Name = "Datum")]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime Date { get; set; } = DateTime.Today;

        public int Amount { get; set; }

        public string Remarks { get; set; }
    }
}
