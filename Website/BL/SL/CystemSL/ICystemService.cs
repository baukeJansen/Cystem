using System.Threading.Tasks;
using Website.Common.Models.EAV;
using Website.Common.Viewmodels;

namespace Website.BL.SL.CystemSL
{
    public interface ICystemService
    {
        Task<GenericViewModel> PreviewDelete(GenericViewModel vm);
    }
}
