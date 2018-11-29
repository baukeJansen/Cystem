using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Data;
using Website.Common.Enums;
using Website.Common.Models;

namespace Website.BL.LL.DailyLL
{
    public interface IDailyLogic
    {
        void UpdateTotal(DateTime date);

        void UpdateTotal(Daily model);

        int StaplesToEggs(EggStaples staples);

        EggStaples EggsToStaples(int eggs);

        SelectList GetExportTypes(EggType _default = EggType.Standard);
    }
}
