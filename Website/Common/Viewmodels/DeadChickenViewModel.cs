using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models;

namespace Website.Common.Viewmodels
{
    public class DeadChickenViewModel : ActionViewModel
    {
        [Display(Name = "Datum")]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime Date { get; set; } = DateTime.Today;

        [Display(Name = "Aantal")]
        public int Amount { get; set; }

        [Display(Name = "Opmerkingen")]
        public string Remarks { get; set; }
    }
}
