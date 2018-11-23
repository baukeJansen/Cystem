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
    public class DailyEggViewModel : ViewModel
    {
        public DailyEgg Model { get; set; }

        public EggStaples Eggs { get; set; }

        public SelectList ExportTypes { get; set; }

        public EggInputType EggInputType { get; set; }

        /*[Display(Name = "2e soort pallets")]
        public int SecondTypePallets { get; set; }
        [Display(Name = "2e soort lagen")]
        public int SecondTypeLayers { get; set; }
        [Display(Name = "2e soort stapels")]
        public int SecondTypeStacks { get; set; }
        [Display(Name = "2e soort trays")]
        public int SecondTypeTrays { get; set; }*/
    }
}
