using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using Website.Common.Data;
using Website.Common.Models.EAV;

namespace Website.BL.QL.ValueQL
{
    public interface IValueQuery
    {
        Task<QueryResult> GetValues(int id, int param = 0);
        Task<QueryResult> GetValues(string url, int param = 0);
        Task<QueryResult> PreviewDeleteCascade(int id);
        Task DeleteValueCascade(int id);
    }
}
