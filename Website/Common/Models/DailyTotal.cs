
using System;
using System.ComponentModel.DataAnnotations;

namespace Website.Common.Models
{
    public class Daily : Model
    {
        [Required]
        public DateTime Date { get; set; }

        public int NormalEggs { get; set; }
        public int SecondKindEggs { get; set; }
        public int SaleEggs { get; set; }
        public int OtherEggs { get; set; }
        public int TotalEggs { get; set; }
        public int AverageEggs { get; set; }
        public int TotalChickens { get; set; }
        public int DeadChickens { get; set; } = 0;
    }
}
