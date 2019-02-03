using System.Threading.Tasks;
using Website.Common.Data;

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
