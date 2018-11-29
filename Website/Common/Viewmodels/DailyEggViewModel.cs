using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Data;
using Website.Common.Enums;
using Website.Common.Models;

namespace Website.Common.Viewmodels
{
    public class DailyEggViewModel : ActionViewModel
    {
        [Display(Name = "Datum")]
        [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime Date { get; set; } = DateTime.Today;

        public EggInputType EggInputType { get; set; }

        [Display(Name = "Eieren")]
        public int Eggs { get; set; }

        public EggStaples EggStaples { get; set; }

        public SelectList ExportTypes { get; set; }

        [Display(Name = "Export type")]
        public EggType ExportType { get; set; } = EggType.Standard;

        [Display(Name = "Leeg na afdraaien")]
        public bool EmptyAfterRun { get; set; } = false;

        [Display(Name = "Opmerkingen")]
        [DataType(DataType.MultilineText)]
        public string Remarks { get; set; }
    }
}
