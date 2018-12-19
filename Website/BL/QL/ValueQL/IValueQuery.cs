using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Models.EAV;

namespace Website.BL.QL.ValueQL
{
    public interface IValueQuery
    {
        Task<Value> GetValues(DbCommand command);
    }
}
